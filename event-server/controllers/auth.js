const authService = require("../services/auth.service");

class AuthController {
  async login(req, res, next) {
    try {
      const { login_users, password_users } = req.body;
      const user = await authService.login(login_users, password_users);

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ message: "Login successful", user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();