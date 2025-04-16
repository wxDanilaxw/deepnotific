const { pool } = require("../models/db");

module.exports = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id_department SERIAL PRIMARY KEY,
        department_name VARCHAR(100) NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS users (
        id_user SERIAL PRIMARY KEY,
        login_users VARCHAR(100) NOT NULL UNIQUE,
        password_users VARCHAR(100) NOT NULL,
        user_role VARCHAR(50) NOT NULL DEFAULT 'user'
      );

      CREATE TABLE IF NOT EXISTS user_departments (
        id_user INT REFERENCES users(id_user) ON DELETE CASCADE,
        id_department INT REFERENCES departments(id_department) ON DELETE CASCADE,
        PRIMARY KEY (id_user, id_department)
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        event_date DATE NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        event_kind VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status BOOLEAN NOT NULL DEFAULT TRUE,
        notified_users INTEGER[] DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS event_departments (
        id_event INT REFERENCES events(id) ON DELETE CASCADE,
        id_department INT REFERENCES departments(id_department) ON DELETE CASCADE,
        PRIMARY KEY (id_event, id_department)
      );
  `);
    console.log("Таблицы созданы или уже существуют");
  } catch (err) {
    console.error("Ошибка при создании таблиц:", err);
  }
};
