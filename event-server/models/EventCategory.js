const { pool } = require("./db");

class EventCategory {
  static async getAll() {
    const { rows } = await pool.query("SELECT * FROM event_categories");
    return rows;
  }
}

module.exports = EventCategory;