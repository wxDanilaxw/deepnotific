// models/User.js
const db = require('./db');

class User {
  static async findByCredentials(login, password) {
    try {
      const { rows } = await db.query(
        'SELECT * FROM users WHERE login_users = $1 AND password_users = $2',
        [login, password]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async createUser(login, password, role = 'user') {
    try {
      const { rows } = await db.query(
        'INSERT INTO users (login_users, password_users, user_role) VALUES ($1, $2, $3) RETURNING *',
        [login, password, role]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;