const Department = require("../models/Department");

module.exports = {
  async getAll(req, res) {
    try {
      const departments = await Department.getAll();
      res.json(departments);
    } catch (err) {
      console.error("Error fetching departments:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
