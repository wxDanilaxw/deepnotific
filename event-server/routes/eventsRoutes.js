const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { check } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ 
  storage, 
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter 
});

// Валидаторы
const eventValidator = [
  check('event_name').notEmpty().withMessage('Event name is required'),
  check('description').notEmpty().withMessage('Description is required'),
  check('start_datetime').isISO8601().withMessage('Invalid start date'),
  check('end_datetime').isISO8601().withMessage('Invalid end date'),
  check('location').notEmpty().withMessage('Location is required'),
  check('id_category').isInt().withMessage('Category ID must be an integer'),
  check('id_department').isInt().withMessage('Department ID must be an integer'),
  check('status').optional().isIn(['planned', 'completed', 'canceled']).withMessage('Invalid status')
];

// Маршруты
router.get('/', eventsController.getAllEvents);
router.get('/:id', eventsController.getEventById);

// Защищенные маршруты (требуют аутентификации)
router.post(
  '/',
  authMiddleware,
  upload.array('attachments'),
  eventValidator,
  eventsController.createEvent
);

router.put(
  '/:id',
  authMiddleware,
  upload.array('attachments'),
  eventValidator,
  eventsController.updateEvent
);

router.delete('/:id', authMiddleware, eventsController.deleteEvent);

module.exports = router;