require('dotenv').config();
const app = require('./app');
const { pool } = require('./models/db'); // Добавьте этот импорт
const createTables = require('./utils/createTables');

const startServer = async (port) => {
  try {
    // Проверка подключения к БД
    const client = await pool.connect();
    console.log('✅ Подключение к базе данных установлено');
    client.release();

    // Создание таблиц
    await createTables();

    // Запуск сервера
    app.listen(port, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Ошибка при запуске сервера:', err.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3000;
startServer(PORT);