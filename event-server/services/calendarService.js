// server/calendarService.js
const pool = require("./db");

class CalendarService {
  // Получение мероприятий для определенного месяца
  async getEventsForMonth(year, month) {
    try {
      // Рассчитываем первый и последний день месяца
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const query = `
        SELECT 
          id, 
          title, 
          description, 
          event_date, 
          event_type, 
          event_kind,
          start_date,
          end_date,
          status
        FROM events
        WHERE event_date BETWEEN $1 AND $2
        ORDER BY event_date ASC;
      `;

      const result = await pool.query(query, [firstDay, lastDay]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching events for month:", error);
      throw error;
    }
  }

  // Получение актуальных объявлений (последние 5)
  async getRecentAnnouncements() {
    try {
      const query = `
        SELECT 
          id, 
          title, 
          description, 
          event_date, 
          event_type, 
          event_kind
        FROM events
        WHERE event_type = 'announcement'
        ORDER BY created_at DESC
        LIMIT 5;
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error fetching recent announcements:", error);
      throw error;
    }
  }

  // Получение мероприятий для конкретной даты
  async getEventsForDate(date) {
    try {
      const query = `
        SELECT 
          id, 
          title, 
          description, 
          event_date, 
          event_type, 
          event_kind,
          start_date,
          end_date,
          status
        FROM events
        WHERE event_date = $1
        ORDER BY event_date ASC;
      `;

      const result = await pool.query(query, [date]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching events for date:", error);
      throw error;
    }
  }
}

module.exports = new CalendarService();
