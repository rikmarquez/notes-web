const db = require('../config/database');

class Connection {
  static async create(sourceNoteId, targetNoteId, connectionType, userId) {
    // Verify both notes belong to the user
    const verifyQuery = `
      SELECT COUNT(*) as count FROM notes 
      WHERE user_id = $1 AND id IN ($2, $3)
    `;
    const verifyResult = await db.query(verifyQuery, [userId, sourceNoteId, targetNoteId]);
    
    if (verifyResult.rows[0].count !== '2') {
      throw new Error('One or both notes do not belong to the user');
    }

    const query = `
      INSERT INTO connections (source_note_id, target_note_id, connection_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (source_note_id, target_note_id, connection_type) DO NOTHING
      RETURNING *
    `;
    const values = [sourceNoteId, targetNoteId, connectionType];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByNoteId(noteId) {
    const query = `
      SELECT c.*, 
        n1.title as source_title,
        n2.title as target_title
      FROM connections c
      JOIN notes n1 ON c.source_note_id = n1.id
      JOIN notes n2 ON c.target_note_id = n2.id
      WHERE (c.source_note_id = $1 OR c.target_note_id = $1)
      ORDER BY c.created_at DESC
    `;
    const result = await db.query(query, [parseInt(noteId) || noteId]);
    return result.rows;
  }

  static async delete(id, userId) {
    const query = `
      DELETE FROM connections 
      WHERE id = $1 
        AND EXISTS (
          SELECT 1 FROM notes 
          WHERE id = connections.source_note_id AND user_id = $2
        )
      RETURNING *
    `;
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  static async findBetweenNotes(sourceNoteId, targetNoteId, userId) {
    const query = `
      SELECT c.* FROM connections c
      JOIN notes n1 ON c.source_note_id = n1.id
      JOIN notes n2 ON c.target_note_id = n2.id
      WHERE ((c.source_note_id = $1 AND c.target_note_id = $2) 
             OR (c.source_note_id = $2 AND c.target_note_id = $1))
        AND n1.user_id = $3 AND n2.user_id = $3
    `;
    const result = await db.query(query, [sourceNoteId, targetNoteId, userId]);
    return result.rows;
  }

  static getConnectionTypes() {
    return [
      'relacionado',
      'contradice',
      'ejemplifica', 
      'inspira',
      'causa_efecto',
      'parte_de'
    ];
  }
}

module.exports = Connection;