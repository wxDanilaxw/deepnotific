const express = require("express");
const router = express.Router();
const { pool } = require("../models/db");
const multer = require("multer");
const path = require("path");

// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Неподдерживаемый тип файла"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: fileFilter,
});

// Валидация данных мероприятия
const validateEventData = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push("Название должно содержать минимум 3 символа");
  }

  if (!data.event_type) {
    errors.push("Тип мероприятия обязателен");
  }

  if (!data.event_kind) {
    errors.push("Вид мероприятия обязателен");
  }

  if (!data.start_date || !data.end_date) {
    errors.push("Даты начала и окончания обязательны");
  } else if (new Date(data.start_date) > new Date(data.end_date)) {
    errors.push("Дата окончания должна быть после даты начала");
  }

  return errors;
};

// Получение всех мероприятий
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, 
       array_agg(DISTINCT d.id_department) as department_ids,
       array_agg(DISTINCT d.department_name) as department_names
       FROM events e
       LEFT JOIN event_departments ed ON e.id = ed.id_event
       LEFT JOIN departments d ON ed.id_department = d.id_department
       GROUP BY e.id
       ORDER BY e.created_at DESC`
    );

    const events = rows.map((row) => ({
      ...row,
      departments: row.department_ids.map((id, index) => ({
        id_department: id,
        department_name: row.department_names[index],
      })),
    }));

    res.json(events);
  } catch (error) {
    console.error("Ошибка при получении мероприятий:", error);
    next(error);
  }
});

// Получение мероприятия по ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const eventQuery = await pool.query(
      `SELECT e.*, 
       array_agg(DISTINCT d.id_department) as department_ids,
       array_agg(DISTINCT d.department_name) as department_names
       FROM events e
       LEFT JOIN event_departments ed ON e.id = ed.id_event
       LEFT JOIN departments d ON ed.id_department = d.id_department
       WHERE e.id = $1
       GROUP BY e.id`,
      [id]
    );

    if (eventQuery.rows.length === 0) {
      return res.status(404).json({ error: "Мероприятие не найдено" });
    }

    const event = eventQuery.rows[0];
    const attachmentsQuery = await pool.query(
      "SELECT * FROM event_attachments WHERE event_id = $1",
      [id]
    );

    const result = {
      ...event,
      departments: event.department_ids.map((id, index) => ({
        id_department: id,
        department_name: event.department_names[index],
      })),
      attachments: attachmentsQuery.rows,
    };

    res.json(result);
  } catch (error) {
    console.error(`Ошибка при получении мероприятия ${req.params.id}:`, error);
    next(error);
  }
});

// Создание нового мероприятия
router.post("/", upload.array("attachments"), async (req, res, next) => {
  try {
    const {
      title,
      description,
      event_type,
      event_kind,
      start_date,
      end_date,
      start_time,
      end_time,
      departments,
    } = req.body;

    // Валидация данных
    const validationErrors = validateEventData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Начало транзакции
    await pool.query("BEGIN");

    // Вставка мероприятия
    const eventResult = await pool.query(
      `INSERT INTO events (
        title, description, event_type, event_kind,
        start_date, end_date, start_time, end_time, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING id`,
      [
        title,
        description,
        event_type,
        event_kind,
        start_date,
        end_date,
        start_time || null,
        end_time || null,
      ]
    );

    const eventId = eventResult.rows[0].id;

    // Обработка отделов
    if (departments) {
      const deptIds = JSON.parse(departments);
      if (deptIds.length > 0) {
        await pool.query(
          `INSERT INTO event_departments (id_event, id_department)
           SELECT $1, unnest($2::int[])`,
          [eventId, deptIds]
        );
      }
    }

    // Обработка файлов
    if (req.files && req.files.length > 0) {
      await pool.query(
        `INSERT INTO event_attachments (event_id, file_path, original_name)
         VALUES ${req.files
           .map((_, i) => `($1, $${i * 3 + 2}, $${i * 3 + 3})`)
           .join(",")}`,
        [
          eventId,
          ...req.files.flatMap((file) => [file.path, file.originalname]),
        ]
      );
    }

    // Фиксация транзакции
    await pool.query("COMMIT");

    // Получаем созданное мероприятие для ответа
    const createdEvent = await pool.query(
      `SELECT e.*, 
       array_agg(DISTINCT d.id_department) as department_ids,
       array_agg(DISTINCT d.department_name) as department_names
       FROM events e
       LEFT JOIN event_departments ed ON e.id = ed.id_event
       LEFT JOIN departments d ON ed.id_department = d.id_department
       WHERE e.id = $1
       GROUP BY e.id`,
      [eventId]
    );

    res.status(201).json({
      message: "Мероприятие успешно создано",
      event: {
        ...createdEvent.rows[0],
        departments: createdEvent.rows[0].department_ids.map((id, index) => ({
          id_department: id,
          department_name: createdEvent.rows[0].department_names[index],
        })),
      },
    });
  } catch (error) {
    // Откат транзакции в случае ошибки
    await pool.query("ROLLBACK");

    console.error("Ошибка при создании мероприятия:", error);

    if (error.code === "23505") {
      // Ошибка уникальности
      return res
        .status(400)
        .json({ error: "Мероприятие с таким названием уже существует" });
    }

    if (error instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ error: "Ошибка загрузки файла: " + error.message });
    }

    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Удаление мероприятия
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Проверка существования мероприятия
    const checkResult = await pool.query(
      "SELECT id FROM events WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Мероприятие не найдено" });
    }

    // Начало транзакции
    await pool.query("BEGIN");

    // Удаление прикрепленных файлов (если нужно удалять физически)
    const attachments = await pool.query(
      "SELECT file_path FROM event_attachments WHERE event_id = $1",
      [id]
    );

    // Здесь можно добавить удаление физических файлов, если нужно
    // const fs = require('fs');
    // attachments.rows.forEach(file => fs.unlinkSync(file.file_path));

    // Удаление мероприятия (каскадное удаление связей)
    await pool.query("DELETE FROM events WHERE id = $1", [id]);

    // Фиксация транзакции
    await pool.query("COMMIT");

    res.json({ message: "Мероприятие успешно удалено" });
  } catch (error) {
    // Откат транзакции в случае ошибки
    await pool.query("ROLLBACK");

    console.error(`Ошибка при удалении мероприятия ${req.params.id}:`, error);

    if (error.code === "23503") {
      // Ошибка внешнего ключа
      return res.status(400).json({
        error:
          "Невозможно удалить мероприятие, так как оно связано с другими данными",
      });
    }

    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

module.exports = router;
