const { pool } = require('../models/db')

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
  ('Основы веб-разработки', 'Введение в HTML, CSS и JavaScript', '2023-05-01 09:00:00', '2023-05-01 11:00:00', 'Аудитория 101', 1, 'planned', 1),
  ('Лабораторная работа по химии', 'Практическое занятие по органической химии', '2023-05-02 13:00:00', '2023-05-02 15:00:00', 'Лаборатория 202', 2, 'planned', 2),
  ('Экономика предприятия', 'Лекция по управлению финансами', '2023-05-03 10:00:00', '2023-05-03 12:00:00', 'Аудитория 303', 3, 'planned', 3),
  ('Мастер-класс по фотографии', 'Основы композиции и освещения', '2023-05-04 14:00:00', '2023-05-04 16:00:00', 'Студия 1', 4, 'planned', 4),
  ('Физика твердого тела', 'Лекция по структуре кристаллов', '2023-05-05 09:30:00', '2023-05-05 11:00:00', 'Аудитория 105', 1, 'planned', 1),
  ('Практика по программированию', 'Разработка простого приложения на Java', '2023-05-06 13:00:00', '2023-05-06 15:30:00', 'Компьютерный класс 3', 1, 'planned', 1),
  ('Лекция по биологии', 'Анатомия человека', '2023-05-07 10:00:00', '2023-05-07 11:30:00', 'Аудитория 204', 2, 'planned', 2),
  ('История искусств', 'Обзор эпох и стилей', '2023-05-08 12:00:00', '2023-05-08 13:30:00', 'Аудитория 301', 3, 'planned', 3),
  ('Введение в маркетинг', 'Основы продвижения товаров', '2023-05-09 14:00:00', '2023-05-09 16:00:00', 'Аудитория 402', 4, 'planned', 4),
  ('Семинар по экологии', 'Влияние человека на окружающую среду', '2023-05-10 09:00:00', '2023-05-10 11:00:00', 'Аудитория 103', 2, 'planned', 2),

  ('Математический анализ', 'Пределы и непрерывность функций', '2023-05-11 10:00:00', '2023-05-11 12:00:00', 'Аудитория 101', 1, 'planned', 1),
  ('Лабораторная работа по физике', 'Изучение законов Ньютона', '2023-05-12 13:00:00', '2023-05-12 15:00:00', 'Лаборатория 203', 1, 'planned', 1),
  ('Финансовый менеджмент', 'Управление денежными потоками', '2023-05-13 09:00:00', '2023-05-13 11:00:00', 'Аудитория 305', 3, 'planned', 3),
  ('Теория музыки', 'Основы гармонии и ритма', '2023-05-14 14:00:00', '2023-05-14 15:30:00', 'Музыкальный зал', 4, 'planned', 4),
  ('Программирование на C++', 'Введение в синтаксис и структуры данных', '2023-05-15 10:00:00', '2023-05-15 12:30:00', 'Компьютерный класс 2', 1, 'planned', 1),
  ('Лекция по медицине', 'Физиология человека', '2023-05-16 13:00:00', '2023-05-16 14:30:00', 'Аудитория 207', 2, 'planned', 2),
  ('История философии', 'Античность и Средневековье', '2023-05-17 11:00:00', '2023-05-17 12:30:00', 'Аудитория 304', 3, 'planned', 3),
  ('Практикум по дизайну', 'Основы работы с графическими редакторами', '2023-05-18 15:00:00', '2023-05-18 17:00:00', 'Дизайн-студия', 4, 'planned', 4),
  ('Химия неорганических соединений', 'Структура и свойства', '2023-05-19 09:00:00', '2023-05-19 11:00:00', 'Лаборатория 201', 2, 'planned', 2),
  ('Введение в экономику', 'Основные понятия и модели', '2023-05-20 10:00:00', '2023-05-20 12:00:00', 'Аудитория 302', 3, 'planned', 3),

  ('Практика по JavaScript', 'Создание интерактивных веб-страниц', '2023-05-21 13:00:00', '2023-05-21 15:00:00', 'Компьютерный класс 1', 1, 'planned', 1),
  ('Лекция по генетике', 'Основы наследственности', '2023-05-22 09:30:00', '2023-05-22 11:00:00', 'Аудитория 205', 2, 'planned', 2),
  ('Маркетинговые стратегии', 'Анализ рынка и конкурентов', '2023-05-23 14:00:00', '2023-05-23 16:00:00', 'Аудитория 403', 4, 'planned', 4),
  ('История литературы', 'Русская классика XIX века', '2023-05-24 10:00:00', '2023-05-24 11:30:00', 'Аудитория 301', 3, 'planned', 3),
  ('Физика плазмы', 'Введение в теорию плазмы', '2023-05-25 13:00:00', '2023-05-25 15:00:00', 'Аудитория 106', 1, 'planned', 1),
  ('Практика по SQL', 'Работа с базами данных', '2023-05-26 09:00:00', '2023-05-26 11:00:00', 'Компьютерный класс 4', 1, 'planned', 1),
  ('Лекция по микробиологии', 'Изучение микроорганизмов', '2023-05-27 14:00:00', '2023-05-27 15:30:00', 'Лаборатория 210', 2, 'planned', 2),
  ('Экономика труда', 'Рынок труда и занятость', '2023-05-28 10:00:00', '2023-05-28 12:00:00', 'Аудитория 303', 3, 'planned', 3),
  ('Введение в UX/UI', 'Основы пользовательского опыта', '2023-05-29 15:00:00', '2023-05-29 17:00:00', 'Дизайн-студия', 4, 'planned', 4),
  ('Химия органических соединений', 'Структура и реакции', '2023-05-30 09:00:00', '2023-05-30 11:00:00', 'Лаборатория 202', 2, 'planned', 2),

  ('Основы алгоритмов', 'Сортировки и поиск', '2023-06-01 09:00:00', '2023-06-01 11:00:00', 'Компьютерный класс 1', 1, 'planned', 1),
  ('Лабораторная работа по биологии', 'Исследование клеток', '2023-06-02 13:00:00', '2023-06-02 15:00:00', 'Лаборатория 205', 2, 'planned', 2),
  ('Финансовый анализ', 'Оценка инвестиционных проектов', '2023-06-03 10:00:00', '2023-06-03 12:00:00', 'Аудитория 305', 3, 'planned', 3),
  ('Театр и драматургия', 'История и жанры', '2023-06-04 14:00:00', '2023-06-04 16:00:00', 'Театральный зал', 4, 'planned', 4),
  ('Программирование на Python', 'Обработка данных', '2023-06-05 10:00:00', '2023-06-05 12:30:00', 'Компьютерный класс 2', 1, 'planned', 1),
  ('Лекция по анатомии', 'Строение органов', '2023-06-06 13:00:00', '2023-06-06 14:30:00', 'Аудитория 207', 2, 'planned', 2),
  ('Философия науки', 'Методы и подходы', '2023-06-07 11:00:00', '2023-06-07 12:30:00', 'Аудитория 304', 3, 'planned', 3),
  ('Практика по графическому дизайну', 'Создание логотипов', '2023-06-08 15:00:00', '2023-06-08 17:00:00', 'Дизайн-студия', 4, 'planned', 4),
  ('Химия аналитическая', 'Методы анализа веществ', '2023-06-09 09:00:00', '2023-06-09 11:00:00', 'Лаборатория 201', 2, 'planned', 2),
  ('Макроэкономика', 'Анализ экономических систем', '2023-06-10 10:00:00', '2023-06-10 12:00:00', 'Аудитория 302', 3, 'planned', 3),

  ('Практика по React', 'Создание SPA приложений', '2023-06-11 13:00:00', '2023-06-11 15:00:00', 'Компьютерный класс 1', 1, 'planned', 1),
  ('Лекция по иммунологии', 'Защитные механизмы организма', '2023-06-12 09:30:00', '2023-06-12 11:00:00', 'Аудитория 205', 2, 'planned', 2),
  ('Маркетинговые коммуникации', 'Реклама и PR', '2023-06-13 14:00:00', '2023-06-13 16:00:00', 'Аудитория 403', 4, 'planned', 4),
  ('Литература XX века', 'Модернизм и постмодернизм', '2023-06-14 10:00:00', '2023-06-14 11:30:00', 'Аудитория 301', 3, 'planned', 3),
  ('Физика атома', 'Структура и свойства', '2023-06-15 13:00:00', '2023-06-15 15:00:00', 'Аудитория 106', 1, 'planned', 1),
  ('Практика по базам данных', 'Создание и запросы', '2023-06-16 09:00:00', '2023-06-16 11:00:00', 'Компьютерный класс 4', 1, 'planned', 1),
  ('Лекция по вирусологии', 'Вирусы и их влияние', '2023-06-17 14:00:00', '2023-06-17 15:30:00', 'Лаборатория 210', 2, 'planned', 2),
  ('Экономика международная', 'Торговля и финансы', '2023-06-18 10:00:00', '2023-06-18 12:00:00', 'Аудитория 303', 3, 'planned', 3),
  ('Основы UX-дизайна', 'Пользовательские интерфейсы', '2023-06-19 15:00:00', '2023-06-19 17:00:00', 'Дизайн-студия', 4, 'planned', 4),
  ('Органическая химия', 'Реакции и свойства', '2023-06-20 09:00:00', '2023-06-20 11:00:00', 'Лаборатория 202', 2, 'planned', 2),

  ('Алгоритмы и структуры данных', 'Основы и применение', '2023-06-21 09:00:00', '2023-06-21 11:00:00', 'Компьютерный класс 1', 1, 'planned', 1),
  ('Практика по микробиологии', 'Исследование бактерий', '2023-06-22 13:00:00', '2023-06-22 15:00:00', 'Лаборатория 205', 2, 'planned', 2),
  ('Финансовое право', 'Регулирование и налогообложение', '2023-06-23 10:00:00', '2023-06-23 12:00:00', 'Аудитория 305', 3, 'planned', 3),
  ('История театра', 'От античности до современности', '2023-06-24 14:00:00', '2023-06-24 16:00:00', 'Театральный зал', 4, 'planned', 4),
  ('Программирование на Java', 'ООП и паттерны', '2023-06-25 10:00:00', '2023-06-25 12:30:00', 'Компьютерный класс 2', 1, 'planned', 1),
  ('Лекция по патологии', 'Болезни и диагностика', '2023-06-26 13:00:00', '2023-06-26 14:30:00', 'Аудитория 207', 2, 'planned', 2),
  ('Философия религии', 'Основные концепции', '2023-06-27 11:00:00', '2023-06-27 12:30:00', 'Аудитория 304', 3, 'planned', 3),
  ('Дизайн упаковки', 'Творческий процесс', '2023-06-28 15:00:00', '2023-06-28 17:00:00', 'Дизайн-студия', 4, 'planned', 4),
  ('Аналитическая химия', 'Методы и приборы', '2023-06-29 09:00:00', '2023-06-29 11:00:00', 'Лаборатория 201', 2, 'planned', 2),
  ('Экономика инноваций', 'Развитие и внедрение', '2023-06-30 10:00:00', '2023-06-30 12:00:00', 'Аудитория 302', 3, 'planned', 3);

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
    `)
		console.log('Все таблицы успешно созданы и заполнены тестовыми данными')
	} catch (err) {
		console.error('Ошибка при создании таблиц:', err)
		throw err
	}
}
