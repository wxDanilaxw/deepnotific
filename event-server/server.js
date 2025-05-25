const app = require("./app");
const { pool } = require("./models/db");
const createTables = require("./utils/createTables");

const PORT = process.env.PORT || 3000;

// Проверка подключения к базе данных
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Ошибка при получении клиента", err.stack);
  }
  console.log("Подключение к базе данных установлено");
  release();
});

// Создание таблиц
createTables();

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});