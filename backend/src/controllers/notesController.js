const Note = require('../models/Note');

const notesController = {
  async createNote(req, res) {
    try {
      const { title, summary, content, tags, images, isPrivate } = req.body;
      const userId = req.user.id;

      const note = await Note.create({
        userId,
        title,
        summary,
        content,
        tags: tags?.map(tag => tag.toLowerCase().trim()) || [],
        images,
        isPrivate: isPrivate || false
      });

      res.status(201).json({
        success: true,
        message: 'Note created successfully',
        data: { note }
      });

    } catch (error) {
      console.error('Create note error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getNotes(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const userId = req.user.id;
      // Mostrar notas públicas + notas privadas del usuario actual
      const notes = await Note.findAllForUser(userId, limit, offset);

      res.json({
        success: true,
        data: {
          notes,
          pagination: {
            page,
            limit,
            hasMore: notes.length === limit
          }
        }
      });

    } catch (error) {
      console.error('Get notes error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getNote(req, res) {
    try {
      const { id } = req.params;

      // Basic ID validation
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Note ID is required'
        });
      }

      const userId = req.user.id;
      const note = await Note.findById(id);
      
      // Check if user can access this note
      if (note && !(await Note.canUserAccess(id, userId))) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: This is a private note'
        });
      }
      
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      res.json({
        success: true,
        data: { note }
      });

    } catch (error) {
      console.error('Get note error:', error);
      
      // More specific error handling
      if (error.message === 'Invalid note ID provided') {
        return res.status(400).json({
          success: false,
          message: 'Invalid note ID format'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async updateNote(req, res) {
    try {
      const { id } = req.params;
      const { title, summary, content, tags, images, isPrivate } = req.body;
      const userId = req.user.id;

      const existingNote = await Note.findById(id);
      if (!existingNote) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // Check if user can access/edit this note
      if (!(await Note.canUserAccess(id, userId))) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot edit private note'
        });
      }

      const updateData = {
        title: title ?? existingNote.title,
        summary: summary ?? existingNote.summary,
        content: content ?? existingNote.content,
        tags: tags ? tags.map(tag => tag.toLowerCase().trim()) : existingNote.tags,
        images: images ?? existingNote.images,
        isPrivate: isPrivate ?? existingNote.is_private
      };

      const updatedNote = await Note.update(id, updateData);
      
      if (!updatedNote) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or not authorized'
        });
      }

      res.json({
        success: true,
        message: 'Note updated successfully',
        data: { note: updatedNote }
      });

    } catch (error) {
      console.error('Update note error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async deleteNote(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if user can delete this note
      if (!(await Note.canUserAccess(id, userId))) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot delete private note'
        });
      }

      const deletedNote = await Note.delete(id);
      
      if (!deletedNote) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      res.json({
        success: true,
        message: 'Note deleted successfully'
      });

    } catch (error) {
      console.error('Delete note error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async searchNotes(req, res) {
    try {
      const { q } = req.query;
      const limit = parseInt(req.query.limit) || 20;

      if (!q || q.trim().length === 0) {
        return res.json({
          success: true,
          data: { notes: [] }
        });
      }

      const userId = req.user.id;
      // Buscar en notas públicas + notas privadas del usuario actual
      const notes = await Note.search(q.trim(), userId, limit);

      res.json({
        success: true,
        data: { notes }
      });

    } catch (error) {
      console.error('Search notes error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getUserTags(req, res) {
    try {
      const userId = req.user.id;
      // Mostrar tags de notas públicas + notas privadas del usuario
      const tags = await Note.getAllTagsForUser(userId);

      res.json({
        success: true,
        data: { tags }
      });

    } catch (error) {
      console.error('Get user tags error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getNotesByTag(req, res) {
    try {
      const { tag } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const userId = req.user.id;
      // Mostrar notas con el tag (públicas + privadas del usuario)
      const notes = await Note.findByTag(tag, userId, limit, offset);

      res.json({
        success: true,
        data: {
          notes,
          tag,
          pagination: {
            page,
            limit,
            hasMore: notes.length === limit
          }
        }
      });

    } catch (error) {
      console.error('Get notes by tag error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async importNotes(req, res) {
    try {
      const { notes } = req.body;
      const userId = req.user.id;

      if (!Array.isArray(notes)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Expected an array of notes.'
        });
      }

      const results = {
        total: notes.length,
        imported: 0,
        failed: 0,
        errors: []
      };

      // Process notes in batches to avoid overwhelming the database
      for (let i = 0; i < notes.length; i++) {
        const noteData = notes[i];
        
        try {
          // Validate required fields
          if (!noteData.title || typeof noteData.title !== 'string') {
            throw new Error(`Note ${i + 1}: Title is required and must be a string`);
          }

          // Map your fields to our database structure
          const mappedNote = {
            userId,
            title: noteData.title.trim(),
            summary: noteData.summary?.trim() || null, // Your TAG field
            content: noteData.content?.trim() || null,  // Your NOTA field
            tags: [], // Empty array for now, can add later if needed
            images: null,
            isPrivate: noteData.isPrivate || false // Allow import of private notes
          };

          await Note.create(mappedNote);
          results.imported++;

        } catch (error) {
          results.failed++;
          results.errors.push({
            note: i + 1,
            title: noteData.title || 'Unknown',
            error: error.message
          });
          
          // Continue processing other notes even if one fails
          console.error(`Import error for note ${i + 1}:`, error.message);
        }
      }

      res.status(200).json({
        success: true,
        message: `Import completed. ${results.imported} notes imported successfully, ${results.failed} failed.`,
        data: results
      });

    } catch (error) {
      console.error('Import notes error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during import'
      });
    }
  }
};

module.exports = notesController;