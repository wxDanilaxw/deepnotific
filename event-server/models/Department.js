const { pool } = require("./db");

const Department = {
  async getAll() {
    const { rows } = await pool.query("SELECT * FROM departments");
    return rows;
  },
};

module.exports = Department;
