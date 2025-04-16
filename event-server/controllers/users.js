const User = require("../models/User");

module.exports = {
  async getByDepartments(req, res) {
    try {
      const users = await User.getByDepartments(req.query.department_id);
      res.json(users);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
