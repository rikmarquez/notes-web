const db = require('../config/database');

class Attachment {
  static async create({ noteId, filename, originalFilename, filePath, fileSize, mimeType, uploadedBy }) {
    try {
      const query = `
        INSERT INTO attachments (note_id, filename, original_filename, file_path, file_size, mime_type, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [noteId, filename, originalFilename, filePath, fileSize, mimeType, uploadedBy];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in Attachment.create:', error);
      throw error;
    }
  }

  static async findById(id) {
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      throw new Error('Invalid attachment ID provided');
    }
    
    const attachmentId = id.toString().trim();
    if (attachmentId === '') {
      throw new Error('Invalid attachment ID provided');
    }
    
    const query = `
      SELECT a.*, u.name as uploader_name, u.email as uploader_email
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.id = $1
    `;
    const result = await db.query(query, [attachmentId]);
    return result.rows[0];
  }

  static async findByNoteId(noteId) {
    if (!noteId || (typeof noteId !== 'string' && typeof noteId !== 'number')) {
      throw new Error('Invalid note ID provided');
    }
    
    const query = `
      SELECT a.*, u.name as uploader_name, u.email as uploader_email
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.note_id = $1
      ORDER BY a.created_at DESC
    `;
    const result = await db.query(query, [noteId]);
    return result.rows;
  }

  static async delete(id) {
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      throw new Error('Invalid attachment ID provided');
    }
    
    const attachmentId = id.toString().trim();
    if (attachmentId === '') {
      throw new Error('Invalid attachment ID provided');
    }
    
    const query = 'DELETE FROM attachments WHERE id = $1 RETURNING *';
    const result = await db.query(query, [attachmentId]);
    return result.rows[0];
  }

  static async deleteByNoteId(noteId) {
    if (!noteId || (typeof noteId !== 'string' && typeof noteId !== 'number')) {
      throw new Error('Invalid note ID provided');
    }
    
    const query = 'DELETE FROM attachments WHERE note_id = $1 RETURNING *';
    const result = await db.query(query, [noteId]);
    return result.rows;
  }

  static async getTotalSizeByUser(userId) {
    if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
      throw new Error('Invalid user ID provided');
    }
    
    const query = `
      SELECT COALESCE(SUM(file_size), 0) as total_size
      FROM attachments a
      JOIN notes n ON a.note_id = n.id
      WHERE n.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0].total_size;
  }
}

module.exports = Attachment;