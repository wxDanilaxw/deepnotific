const User = require("../models/User");

module.exports = {
  async login(req, res) {
    const { login_users, password_users } = req.body;

    try {
      const user = await User.getByCredentials(login_users, password_users);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.json({ message: "Login successful", user });
    } catch (err) {
      console.error("Error during login:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
