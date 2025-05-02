// server/routes/calendarRoutes.js
const express = require("express");
const router = express.Router();
const { Event, Department, User } = require("../models");
const { Op } = require("sequelize");

// Получение мероприятий для месяца
router.get("/month-events", async (req, res) => {
  try {
    const { year, month, userId } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: "Year and month are required" });
    }

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0);

    let where = {
      event_date: {
        [Op.between]: [startDate, endDate],
      },
      status: true,
    };

    // Если указан userId, фильтруем по его отделам
    if (userId) {
      const userDepartments = await Department.findAll({
        include: [
          {
            model: User,
            where: { id_user: userId },
            through: { attributes: [] },
          },
        ],
      });

      const departmentIds = userDepartments.map((d) => d.id_department);

      where["$event_departments.id_department$"] = {
        [Op.in]: departmentIds,
      };
    }

    const events = await Event.findAll({
      where,
      include: [
        {
          model: Department,
          as: "event_departments",
          through: { attributes: [] },
          attributes: ["id_department", "department_name"],
        },
      ],
      order: [["event_date", "ASC"]],
    });

    res.json(events);
  } catch (error) {
    console.error("Error in /month-events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Получение мероприятий для конкретной даты
router.get("/date-events", async (req, res) => {
  try {
    const { date, userId } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    let where = {
      event_date: date,
      status: true,
    };

    // Если указан userId, фильтруем по его отделам
    if (userId) {
      const userDepartments = await Department.findAll({
        include: [
          {
            model: User,
            where: { id_user: userId },
            through: { attributes: [] },
          },
        ],
      });

      const departmentIds = userDepartments.map((d) => d.id_department);

      where["$event_departments.id_department$"] = {
        [Op.in]: departmentIds,
      };
    }

    const events = await Event.findAll({
      where,
      include: [
        {
          model: Department,
          as: "event_departments",
          through: { attributes: [] },
          attributes: ["id_department", "department_name"],
        },
      ],
      order: [["event_date", "ASC"]],
    });

    res.json(events);
  } catch (error) {
    console.error("Error in /date-events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Получение актуальных объявлений
router.get("/announcements", async (req, res) => {
  try {
    const events = await Event.findAll({
      where: {
        event_type: "announcement",
        status: true,
      },
      order: [["created_at", "DESC"]],
      limit: 5,
    });

    res.json(events);
  } catch (error) {
    console.error("Error in /announcements:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
