const db = require('../config/database');

class Note {
  static async create({ userId, title, summary, content, tags, images, isPrivate = false }) {
    try {
      const query = `
        INSERT INTO notes (user_id, title, summary, content, tags, images, is_private)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [
        userId, 
        title, 
        summary || null, 
        content || null, 
        Array.isArray(tags) ? tags : [], 
        images || null,
        isPrivate
      ];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in Note.create:', error);
      throw error;
    }
  }

  static async findById(id) {
    // Validate ID - accept UUIDs and integer strings
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      throw new Error('Invalid note ID provided');
    }
    
    // Convert to string for consistency
    const noteId = id.toString().trim();
    
    // Basic validation - not empty after trim
    if (noteId === '') {
      throw new Error('Invalid note ID provided');
    }
    
    const query = `
      SELECT n.*, u.name as author_name, u.email as author_email 
      FROM notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.id = $1
    `;
    const result = await db.query(query, [noteId]);
    return result.rows[0];
  }

  static async findAll(limit = 20, offset = 0) {
    const query = `
      SELECT n.*, u.name as author_name, u.email as author_email 
      FROM notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.is_private = false OR n.is_private IS NULL
      ORDER BY n.updated_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  }

  static async findByUser(userId, limit = 20, offset = 0) {
    const query = `
      SELECT n.*, u.name as author_name, u.email as author_email 
      FROM notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.user_id = $1 
      ORDER BY n.updated_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [userId, limit, offset]);
    return result.rows;
  }

  // New method: Get all notes accessible to a user (public + their private)
  static async findAllForUser(currentUserId, limit = 20, offset = 0) {
    const query = `
      SELECT n.*, u.name as author_name, u.email as author_email 
      FROM notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE (n.is_private = false OR n.is_private IS NULL OR n.user_id = $1)
      ORDER BY n.updated_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [currentUserId, limit, offset]);
    return result.rows;
  }

  // Check if user can access note (public or owns it)
  static async canUserAccess(noteId, userId) {
    const query = `
      SELECT id, user_id, is_private
      FROM notes 
      WHERE id = $1
    `;
    const result = await db.query(query, [noteId]);
    const note = result.rows[0];
    
    if (!note) return false;
    
    // If note is public (false or null), anyone can access
    if (!note.is_private) return true;
    
    // If note is private, only owner can access
    return note.user_id === userId;
  }

  static async update(id, { title, summary, content, tags, images, isPrivate }) {
    // Validate ID - accept UUIDs and integer strings
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      throw new Error('Invalid note ID provided');
    }
    
    const noteId = id.toString().trim();
    if (noteId === '') {
      throw new Error('Invalid note ID provided');
    }
    
    const query = `
      UPDATE notes 
      SET title = $1, summary = $2, content = $3, tags = $4, images = $5, is_private = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const values = [title, summary, content, tags || [], images, isPrivate, noteId];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    // Validate ID - accept UUIDs and integer strings
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      throw new Error('Invalid note ID provided');
    }
    
    const noteId = id.toString().trim();
    if (noteId === '') {
      throw new Error('Invalid note ID provided');
    }
    
    const query = 'DELETE FROM notes WHERE id = $1 RETURNING *';
    const result = await db.query(query, [noteId]);
    return result.rows[0];
  }

  static async search(searchTerm, currentUserId = null, limit = 20) {
    // If no user provided, only search public notes
    // If user provided, search public notes + their private notes
    const query = `
      SELECT n.*, u.name as author_name, u.email as author_email,
        ts_rank(
          to_tsvector('spanish', n.title || ' ' || COALESCE(n.summary, '') || ' ' || COALESCE(n.content, '')),
          plainto_tsquery('spanish', $1)
        ) AS rank
      FROM notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE (
          to_tsvector('spanish', n.title) @@ plainto_tsquery('spanish', $1) OR
          to_tsvector('spanish', COALESCE(n.summary, '')) @@ plainto_tsquery('spanish', $1) OR
          to_tsvector('spanish', COALESCE(n.content, '')) @@ plainto_tsquery('spanish', $1) OR
          LOWER($1) = ANY(SELECT LOWER(unnest(n.tags))) OR
          n.title ILIKE '%' || $1 || '%' OR
          n.summary ILIKE '%' || $1 || '%' OR
          n.content ILIKE '%' || $1 || '%'
        )
        AND (
          n.is_private = false OR n.is_private IS NULL 
          ${currentUserId ? 'OR n.user_id = $3' : ''}
        )
      ORDER BY rank DESC, n.updated_at DESC
      LIMIT $2
    `;
    
    const params = currentUserId ? [searchTerm, limit, currentUserId] : [searchTerm, limit];
    const result = await db.query(query, params);
    return result.rows;
  }

  static async getAllTags() {
    const query = `
      SELECT DISTINCT unnest(tags) as tag, COUNT(*) as count
      FROM notes 
      WHERE tags IS NOT NULL AND (is_private = false OR is_private IS NULL)
      GROUP BY tag
      ORDER BY count DESC, tag ASC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Get all tags accessible to a user (public + their private)
  static async getAllTagsForUser(userId) {
    const query = `
      SELECT DISTINCT unnest(tags) as tag, COUNT(*) as count
      FROM notes 
      WHERE tags IS NOT NULL 
        AND (is_private = false OR is_private IS NULL OR user_id = $1)
      GROUP BY tag
      ORDER BY count DESC, tag ASC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static async getUserTags(userId) {
    const query = `
      SELECT DISTINCT unnest(tags) as tag, COUNT(*) as count
      FROM notes 
      WHERE user_id = $1 AND tags IS NOT NULL
      GROUP BY tag
      ORDER BY count DESC, tag ASC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static async findByTag(tag, currentUserId = null, limit = 20, offset = 0) {
    const query = `
      SELECT n.*, u.name as author_name, u.email as author_email 
      FROM notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE LOWER($1) = ANY(SELECT LOWER(unnest(n.tags)))
        AND (
          n.is_private = false OR n.is_private IS NULL 
          ${currentUserId ? 'OR n.user_id = $4' : ''}
        )
      ORDER BY n.updated_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const params = currentUserId ? [tag, limit, offset, currentUserId] : [tag, limit, offset];
    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = Note;