const Note = require('../models/Note');

const notesController = {
  async createNote(req, res) {
    try {
      const { title, summary, content, tags, images } = req.body;
      const userId = req.user.id;

      const note = await Note.create({
        userId,
        title,
        summary,
        content,
        tags: tags?.map(tag => tag.toLowerCase().trim()) || [],
        images
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

      // Mostrar todas las notas de todos los usuarios
      const notes = await Note.findAll(limit, offset);

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

      // Cualquier usuario puede ver cualquier nota
      const note = await Note.findById(id);
      
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
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async updateNote(req, res) {
    try {
      const { id } = req.params;
      const { title, summary, content, tags, images } = req.body;
      const userId = req.user.id;

      const existingNote = await Note.findById(id, userId);
      if (!existingNote) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      const updatedNote = await Note.update(id, userId, {
        title: title ?? existingNote.title,
        summary: summary ?? existingNote.summary,
        content: content ?? existingNote.content,
        tags: tags ? tags.map(tag => tag.toLowerCase().trim()) : existingNote.tags,
        images: images ?? existingNote.images
      });

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

      const deletedNote = await Note.delete(id, userId);
      
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

      // Buscar en todas las notas de todos los usuarios
      const notes = await Note.search(q.trim(), limit);

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
      // Mostrar todos los tags de todas las notas
      const tags = await Note.getAllTags();

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

      // Mostrar notas con el tag de todos los usuarios
      const notes = await Note.findByTag(tag, limit, offset);

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
  }
};

module.exports = notesController;