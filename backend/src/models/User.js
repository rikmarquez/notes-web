const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, name }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const query = `
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, created_at
    `;
    const values = [email, hashedPassword, name];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, name, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProfile(id, { name }) {
    const query = `
      UPDATE users 
      SET name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, name, updated_at
    `;
    const result = await db.query(query, [name, id]);
    return result.rows[0];
  }
}

module.exports = User;