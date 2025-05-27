const EventCategory = require("../models/EventCategory");

module.exports = {
  async getAll(req, res) {
    try {
      const categories = await EventCategory.getAll();
      res.json(categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};