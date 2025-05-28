const { pool } = require('./db');

class Event {
  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM events ORDER BY start_datetime DESC');
    return rows;
  }

  static async create(eventData) {
    const query = `
      INSERT INTO events 
      (event_name, description, start_datetime, end_datetime, location, id_category, id_department, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_event
    `;
    const values = [
      eventData.event_name,
      eventData.description,
      eventData.start_datetime,
      eventData.end_datetime,
      eventData.location,
      eventData.id_category,
      eventData.id_department,
      eventData.status || 'planned'
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0].id_event;
  }

  static async update(id, eventData) {
    const query = `
      UPDATE events SET
        event_name = $1,
        description = $2,
        start_datetime = $3,
        end_datetime = $4,
        location = $5,
        id_category = $6,
        id_department = $7,
        status = $8
      WHERE id_event = $9
    `;
    const values = [
      eventData.event_name,
      eventData.description,
      eventData.start_datetime,
      eventData.end_datetime,
      eventData.location,
      eventData.id_category,
      eventData.id_department,
      eventData.status || 'planned',
      id
    ];
    
    const { rowCount } = await pool.query(query, values);
    return rowCount > 0;
  }

  static async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM events WHERE id_event = $1', [id]);
    return rowCount > 0;
  }

  
}

module.exports = Event;