// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Middleware функция для логирования запросов
const requestLogger = (req, res, next) => {
  logger.info({
    message: 'Request received',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    body: req.body,
  });
  next();
};

module.exports = { logger, requestLogger };