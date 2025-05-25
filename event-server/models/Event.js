const { pool } = require("./db");

class Event {
  static async getAll() {
    const { rows } = await pool.query(`
      SELECT e.*, 
      array_agg(DISTINCT d.id_department) as department_ids
      FROM events e
      LEFT JOIN event_departments ed ON e.id = ed.id_event
      LEFT JOIN departments d ON ed.id_department = d.id_department
      GROUP BY e.id
      ORDER BY e.start_date
    `);
    return rows;
  }

  static async getById(id) {
    const { rows } = await pool.query(`
      SELECT e.*, 
      array_agg(DISTINCT d.id_department) as department_ids
      FROM events e
      LEFT JOIN event_departments ed ON e.id = ed.id_event
      LEFT JOIN departments d ON ed.id_department = d.id_department
      WHERE e.id = $1
      GROUP BY e.id
    `, [id]);
    return rows[0] || null;
  }

  static async create({ title, description, start_date, end_date, departments = [] }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const { rows } = await client.query(
        `INSERT INTO events (title, description, start_date, end_date)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [title, description, start_date, end_date]
      );
      
      const eventId = rows[0].id;
      
      for (const deptId of departments) {
        await client.query(
          `INSERT INTO event_departments (id_event, id_department)
           VALUES ($1, $2)`,
          [eventId, deptId]
        );
      }
      
      await client.query('COMMIT');
      return eventId;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async delete(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM events WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }
}

module.exports = Event;