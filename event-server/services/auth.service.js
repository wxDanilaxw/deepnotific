const { pool } = require("../models/db");

class AuthService {
  async login(login_users, password_users) {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE login_users = $1 AND password_users = $2",
        [login_users, password_users]
      );
      return rows[0] || null;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new AuthService();