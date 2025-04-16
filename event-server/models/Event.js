const { pool } = require("./db");

const Event = {
  async getAll(eventDate = null) {
    let query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_type,
        e.event_kind,
        e.start_date,
        e.end_date,
        e.status,
        COALESCE(ARRAY_AGG(u.login_users) FILTER (WHERE u.login_users IS NOT NULL), '{}') AS notified_users,
        COALESCE(ARRAY_AGG(d.department_name) FILTER (WHERE d.department_name IS NOT NULL), '{}') AS departments
      FROM events e
      LEFT JOIN event_departments ed ON e.id = ed.id_event
      LEFT JOIN departments d ON ed.id_department = d.id_department
      LEFT JOIN users u ON u.id_user = ANY(e.notified_users)
    `;
    let params = [];

    if (eventDate) {
      query += " WHERE e.event_date = $1";
      params.push(eventDate);
    }

    query += " GROUP BY e.id";

    const { rows } = await pool.query(query, params);
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query("SELECT * FROM events WHERE id = $1", [
      id,
    ]);
    return rows[0] || null;
  },

  async create(eventData) {
    const {
      title,
      description,
      event_type,
      event_kind,
      start_date,
      end_date,
      status,
      departments,
      notified_users,
    } = eventData;

    await pool.query("BEGIN");

    const eventResult = await pool.query(
      `INSERT INTO events (
        title, description, event_type, event_kind, 
        start_date, end_date, status, notified_users
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        title,
        description,
        event_type,
        event_kind,
        start_date,
        end_date,
        status || true,
        notified_users || [],
      ]
    );

    const eventId = eventResult.rows[0].id;

    for (const departmentId of departments) {
      await pool.query(
        "INSERT INTO event_departments (id_event, id_department) VALUES ($1, $2)",
        [eventId, departmentId]
      );
    }

    await pool.query("COMMIT");
    return eventId;
  },

  async delete(id) {
    const { rows } = await pool.query(
      "DELETE FROM events WHERE id = $1 RETURNING *",
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = Event;
