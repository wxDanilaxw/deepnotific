require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool } = require('./models/db'); // Добавьте этот импорт

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Тестовый маршрут для проверки БД
app.get('/api/test-db', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.json({ dbTime: rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'DB error', details: err.message });
  }
});

// Подключение маршрутов
const eventsRoutes = require('./routes/eventsRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/api/events', eventsRoutes);
app.use('/api/auth', authRoutes);

// Обработчик ошибок
const errorHandler = require('./utils/errorHandler');
app.use(errorHandler);

module.exports = app;