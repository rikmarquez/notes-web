const db = require('../config/database');

class Note {
  static async create({ userId, title, summary, content, tags, images }) {
    try {
      const query = `
        INSERT INTO notes (user_id, title, summary, content, tags, images)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const values = [
        userId, 
        title, 
        summary || null, 
        content || null, 
        Array.isArray(tags) ? tags : [], 
        images || null
      ];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in Note.create:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT n.*, u.name as author_name, u.email as author_email 
      FROM notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(limit = 20, offset = 0) {
    const query = `
      SELECT n.*, u.name as author_name, u.email as author_email 
      FROM notes n
      LEFT JOIN users u ON n.user_id = u.id
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

  static async update(id, userId, { title, summary, content, tags, images }) {
    const query = `
      UPDATE notes 
      SET title = $1, summary = $2, content = $3, tags = $4, images = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND user_id = $7
      RETURNING *
    `;
    const values = [title, summary, content, tags || [], images, id, userId];
    console.log('Note.update query:', { query, values }); // Debug log
    const result = await db.query(query, values);
    console.log('Note.update result:', { rowCount: result.rowCount, rows: result.rows }); // Debug log
    return result.rows[0];
  }

  static async delete(id, userId) {
    const query = 'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  static async search(searchTerm, limit = 20) {
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
          $1 = ANY(n.tags)
        )
      ORDER BY rank DESC, n.updated_at DESC
      LIMIT $2
    `;
    const result = await db.query(query, [searchTerm, limit]);
    return result.rows;
  }

  static async getAllTags() {
    const query = `
      SELECT DISTINCT unnest(tags) as tag, COUNT(*) as count
      FROM notes 
      WHERE tags IS NOT NULL
      GROUP BY tag
      ORDER BY count DESC, tag ASC
    `;
    const result = await db.query(query);
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

  static async findByTag(tag, limit = 20, offset = 0) {
    const query = `
      SELECT n.*, u.name as author_name, u.email as author_email 
      FROM notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE $1 = ANY(n.tags)
      ORDER BY n.updated_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [tag, limit, offset]);
    return result.rows;
  }
}

module.exports = Note;