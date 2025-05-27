require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const { pool } = require('./models/db');

const app = express();

// Базовые middleware
app.use(morgan('dev')); // Логирование запросов
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Тестовый маршрут для проверки работы сервера и БД
app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW() as db_time, version() as db_version');
    res.json({
      status: 'OK',
      db: {
        time: rows[0].db_time,
        version: rows[0].db_version
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      error: 'Database connection failed',
      details: err.message
    });
  }
});

// Подключение маршрутов
const apiRoutes = [
  { path: '/api/events', router: require('./routes/eventsRoutes') },
  { path: '/api/auth', router: require('./routes/authRoutes') },
  { path: '/api/departments', router: require('./routes/departments.routes') },
  { path: '/api/event-categories', router: require('./routes/eventCategories') }
];

apiRoutes.forEach(route => {
  app.use(route.path, route.router);
  console.log(`🛣️  Маршрут подключен: ${route.path}`);
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    status: 'ERROR',
    message: 'Endpoint not found',
    path: req.path
  });
});

// Централизованный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    request: {
      method: req.method,
      url: req.originalUrl,
      body: req.body
    }
  });

  res.status(err.status || 500).json({
    status: 'ERROR',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = app;