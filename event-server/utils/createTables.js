const { pool } = require("../models/db");

module.exports = async () => {
  try {
    await pool.query(`
      -- 1. Удаление существующих таблиц (если нужно начать с чистого листа)
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS system_settings CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS comments CASCADE;
      DROP TABLE IF EXISTS event_attachments CASCADE;
      DROP TABLE IF EXISTS event_participants CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS event_categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS departments CASCADE;

      -- 2. Создание таблиц
      CREATE TABLE departments (
          id_department SERIAL PRIMARY KEY,
          department_name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          status BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE users (
          id_user SERIAL PRIMARY KEY,
          login_users VARCHAR(100) NOT NULL UNIQUE,
          password_users VARCHAR(100) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          user_role VARCHAR(50) NOT NULL DEFAULT 'user',
          phone VARCHAR(20),
          email VARCHAR(100),
          id_department INT REFERENCES departments(id_department) ON DELETE SET NULL
      );

      CREATE TABLE event_categories (
          id_category SERIAL PRIMARY KEY,
          category_name VARCHAR(100) NOT NULL,
          category_code VARCHAR(50) NOT NULL UNIQUE
      );

      CREATE TABLE events (
          id_event SERIAL PRIMARY KEY,
          event_name VARCHAR(255) NOT NULL,
          description TEXT,
          start_datetime TIMESTAMP NOT NULL,
          end_datetime TIMESTAMP NOT NULL,
          location VARCHAR(255),
          id_category INT REFERENCES event_categories(id_category) ON DELETE SET NULL,
          status VARCHAR(50) DEFAULT 'planned',
          id_department INT REFERENCES departments(id_department) ON DELETE SET NULL,
          CONSTRAINT events_name_start_unique UNIQUE (event_name, start_datetime)
      );

      CREATE TABLE event_participants (
          id_participant SERIAL PRIMARY KEY,
          id_event INT REFERENCES events(id_event) ON DELETE CASCADE,
          id_user INT REFERENCES users(id_user) ON DELETE CASCADE,
          participant_role VARCHAR(50) NOT NULL,
          participation_status VARCHAR(50) DEFAULT 'registered',
          UNIQUE (id_event, id_user)
      );

      CREATE TABLE event_attachments (
          id_attachment SERIAL PRIMARY KEY,
          id_event INT REFERENCES events(id_event) ON DELETE CASCADE,
          attachment_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(512) NOT NULL,
          file_type VARCHAR(100) NOT NULL,
          file_size INTEGER NOT NULL,
          upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE comments (
          id_comment SERIAL PRIMARY KEY,
          id_event INT REFERENCES events(id_event) ON DELETE CASCADE,
          id_author INT REFERENCES users(id_user) ON DELETE SET NULL,
          comment_text TEXT NOT NULL,
          creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          update_date TIMESTAMP
      );

      CREATE TABLE notifications (
          id_notification SERIAL PRIMARY KEY,
          id_recipient INT REFERENCES users(id_user) ON DELETE CASCADE,
          notification_type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          notification_status VARCHAR(50) DEFAULT 'unread',
          creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          id_event INT REFERENCES events(id_event) ON DELETE SET NULL
      );

      CREATE TABLE activity_logs (
          id_log SERIAL PRIMARY KEY,
          id_user INT REFERENCES users(id_user) ON DELETE SET NULL,
          action_type VARCHAR(100) NOT NULL,
          action_details TEXT,
          ip_address VARCHAR(45),
          user_agent TEXT,
          action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE system_settings (
          id_setting SERIAL PRIMARY KEY,
          setting_name VARCHAR(100) NOT NULL UNIQUE,
          setting_value TEXT,
          description TEXT
      );

      -- 3. Заполнение таблиц тестовыми данными
      -- Отделы
      INSERT INTO departments (department_name, description, status) VALUES
      ('Информационные технологии', 'Отдел информационных технологий и программирования', TRUE),
      ('Механика', 'Отдел механических технологий и машиностроения', TRUE),
      ('Экономика', 'Отдел экономики и бухгалтерского учета', TRUE),
      ('Администрация', 'Административный отдел техникума', TRUE);

      -- Пользователи
      INSERT INTO users (login_users, password_users, full_name, user_role, phone, email, id_department) VALUES
      ('admin', 'admin123', 'Иванов Иван Иванович', 'admin', '+79161234567', 'admin@example.com', 4),
      ('teacher1', 'teacher1', 'Петрова Мария Сергеевна', 'teacher', '+79162223344', 'petrova@example.com', 1),
      ('teacher2', 'teacher2', 'Сидоров Алексей Владимирович', 'teacher', '+79163334455', 'sidorov@example.com', 2),
      ('student1', 'student1', 'Кузнецова Анна Дмитриевна', 'student', '+79164445566', 'kuznetsova@example.com', 1),
      ('student2', 'student2', 'Николаев Денис Олегович', 'student', '+79165556677', 'nikolaev@example.com', 2);

      -- Категории событий
      INSERT INTO event_categories (category_name, category_code) VALUES
      ('Лекция', 'LECTURE'),
      ('Практическое занятие', 'PRACTICE'),
      ('Экзамен', 'EXAM'),
      ('Мероприятие', 'EVENT'),
      ('Консультация', 'CONSULT');

      -- События
      INSERT INTO events (event_name, description, start_datetime, end_datetime, location, id_category, status, id_department) VALUES
      ('Введение в программирование', 'Базовые понятия программирования на Python', '2023-09-01 09:00:00', '2023-09-01 10:30:00', 'Аудитория 101', 1, 'completed', 1),
      ('Механика жидкостей', 'Практическое занятие по гидравлике', '2023-09-02 10:00:00', '2023-09-02 12:00:00', 'Лаборатория 205', 2, 'planned', 2),
      ('Экономическая теория', 'Лекция по макроэкономике', '2023-09-03 13:00:00', '2023-09-03 14:30:00', 'Аудитория 302', 1, 'planned', 3),
      ('День открытых дверей', 'Мероприятие для абитуриентов', '2023-09-15 10:00:00', '2023-09-15 15:00:00', 'Актовый зал', 4, 'planned', 4);

      -- Участники событий
      INSERT INTO event_participants (id_event, id_user, participant_role, participation_status) VALUES
      (1, 2, 'Преподаватель', 'confirmed'),
      (1, 4, 'Студент', 'registered'),
      (2, 3, 'Преподаватель', 'confirmed'),
      (2, 5, 'Студент', 'registered'),
      (3, 2, 'Преподаватель', 'confirmed'),
      (4, 1, 'Организатор', 'confirmed'),
      (4, 2, 'Ответственный', 'confirmed'),
      (4, 4, 'Участник', 'registered');

      -- Приложения к событиям
      INSERT INTO event_attachments (id_event, attachment_name, file_path, file_type, file_size) VALUES
      (1, 'Презентация Python', '/uploads/python_intro.pdf', 'application/pdf', 2500),
      (1, 'Примеры кода', '/uploads/python_examples.zip', 'application/zip', 1500),
      (2, 'Лабораторная работа', '/uploads/hydraulics_lab.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1800);

      -- Комментарии
      INSERT INTO comments (id_event, id_author, comment_text) VALUES
      (1, 2, 'Не забудьте установить Python перед занятием'),
      (1, 4, 'Какая версия Python нужна?'),
      (1, 2, 'Любая версия 3.х подойдет'),
      (2, 3, 'Принести тетради для лабораторных работ');

      -- Уведомления
      INSERT INTO notifications (id_recipient, notification_type, title, message, notification_status, id_event) VALUES
      (4, 'reminder', 'Напоминание о занятии', 'Завтра в 9:00 занятие по Python', 'unread', 1),
      (5, 'reminder', 'Напоминание о занятии', 'Завтра в 10:00 практика по механике', 'read', 2),
      (2, 'update', 'Изменение в расписании', 'Лекция перенесена на 13:30', 'unread', 3);

      -- Логи действий
      INSERT INTO activity_logs (id_user, action_type, action_details, ip_address, user_agent) VALUES
      (1, 'login', 'Успешный вход в систему', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0)'),
      (2, 'event_create', 'Создано новое событие: Введение в программирование', '192.168.1.2', 'Mozilla/5.0 (Macintosh)'),
      (4, 'comment_add', 'Добавлен комментарий к событию 1', '192.168.1.3', 'Chrome/114.0.0.0');

      -- Системные настройки
      INSERT INTO system_settings (setting_name, setting_value, description) VALUES
      ('email_notifications', 'true', 'Включить email уведомления'),
      ('default_reminder_time', '24', 'За сколько часов напоминать о событиях'),
      ('max_file_size', '10', 'Максимальный размер файла (МБ)');
    `);
    console.log("Все таблицы успешно созданы и заполнены тестовыми данными");
  } catch (err) {
    console.error("Ошибка при создании таблиц:", err);
    throw err;
  }
};