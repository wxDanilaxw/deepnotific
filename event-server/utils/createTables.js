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


      -- Добавляем тестовые отделы
      INSERT INTO departments (department_name) VALUES 
      ('Отдел разработки'),
      ('Отдел маркетинга'),
      ('Отдел продаж');

      -- Добавляем тестового пользователя
      INSERT INTO users (login_users, password_users, user_role) VALUES 
      ('testuser', 'hashedpassword', 'user');

      -- Добавляем тестовые мероприятия
      INSERT INTO events (title, description, event_date, event_type, event_kind, start_date, end_date) VALUES 
      ('Совещание по проекту', 'Обсуждение текущего состояния проекта', '2023-06-15', 'meeting', 'internal', '2023-06-15', '2023-06-15'),
      ('Презентация продукта', 'Презентация нового продукта клиентам', '2023-06-20', 'presentation', 'external', '2023-06-20', '2023-06-20'),
      ('Корпоративное мероприятие', 'Ежегодный корпоратив', '2023-06-25', 'event', 'internal', '2023-06-25', '2023-06-25'),
      ('Важное объявление', 'Информация об изменениях в компании', '2023-06-01', 'announcement', 'internal', '2023-06-01', '2023-06-01');

      -- Связываем мероприятия с отделами
      INSERT INTO event_departments (id_event, id_department) VALUES 
      (1, 1), -- Совещание для отдела разработки
      (2, 2), -- Презентация для отдела маркетинга
      (2, 3), -- Презентация для отдела продаж
      (3, 1), -- Корпоратив для всех отделов
      (3, 2),
      (3, 3),
      (4, 1),
      (4, 2),
      (4, 3);

      -- Связываем пользователя с отделами
      INSERT INTO user_departments (id_user, id_department) VALUES 
      (1, 1); -- Пользователь в отделе разработки
  `);
    console.log("Таблицы созданы или уже существуют");
  } catch (err) {
    console.error("Ошибка при создании таблиц:", err);
  }
};
