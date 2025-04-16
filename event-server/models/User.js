const { pool } = require("./db");

const User = {
  async getByCredentials(login, password) {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE login_users = $1 AND password_users = $2",
      [login, password]
    );
    return rows[0] || null;
  },

  async getByDepartments(departmentIds) {
    let query = "SELECT * FROM users";
    let params = [];

    if (departmentIds) {
      query += " WHERE id_department = ANY($1::int[])";
      params.push(departmentIds.split(",").map(Number));
    }

    const { rows } = await pool.query(query, params);
    return rows;
  },
};

module.exports = User;
