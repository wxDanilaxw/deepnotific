const { pool } = require("./db");

class Notification {
  static async getUnreadByUser(userId) {
    const { rows } = await pool.query(`
      SELECT * FROM notifications 
      WHERE id_recipient = $1 AND notification_status = 'unread'
    `, [userId]);
    return rows;
  }

  static async markAsRead(userId, eventId) {
    await pool.query(`
      UPDATE notifications 
      SET notification_status = 'read' 
      WHERE id_recipient = $1 AND id_event = $2
    `, [userId, eventId]);
  }
}

module.exports = Notification;