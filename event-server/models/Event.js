const { pool } = require('./db');

class Event {
  static async getAll() {
    const query = `
      SELECT 
        e.id_event, e.event_name, e.description, 
        e.start_datetime, e.end_datetime, e.location,
        e.status, 
        ec.id_category, ec.category_name, ec.category_code,
        d.id_department, d.department_name,
        json_agg(
          DISTINCT jsonb_build_object(
            'id_attachment', ea.id_attachment,
            'name', ea.attachment_name,
            'type', ea.file_type
          )
        ) as attachments,
        json_agg(
          DISTINCT jsonb_build_object(
            'id_user', ep.id_user,
            'full_name', u.full_name,
            'role', ep.participant_role
          )
        ) as participants
      FROM events e
      LEFT JOIN event_categories ec ON e.id_category = ec.id_category
      LEFT JOIN departments d ON e.id_department = d.id_department
      LEFT JOIN event_attachments ea ON e.id_event = ea.id_event
      LEFT JOIN event_participants ep ON e.id_event = ep.id_event
      LEFT JOIN users u ON ep.id_user = u.id_user
      GROUP BY e.id_event, ec.id_category, d.id_department
      ORDER BY e.start_datetime DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getById(id) {
    const query = `
      SELECT 
        e.id_event, e.event_name, e.description, 
        e.start_datetime, e.end_datetime, e.location,
        e.status, 
        ec.id_category, ec.category_name, ec.category_code,
        d.id_department, d.department_name,
        json_agg(
          DISTINCT jsonb_build_object(
            'id_attachment', ea.id_attachment,
            'name', ea.attachment_name,
            'type', ea.file_type,
            'path', ea.file_path
          )
        ) as attachments,
        json_agg(
          DISTINCT jsonb_build_object(
            'id_user', ep.id_user,
            'full_name', u.full_name,
            'role', ep.participant_role,
            'status', ep.participation_status
          )
        ) as participants,
        json_agg(
          DISTINCT jsonb_build_object(
            'id_comment', c.id_comment,
            'author', jsonb_build_object(
              'id_user', c.id_author,
              'full_name', au.full_name
            ),
            'text', c.comment_text,
            'date', c.creation_date
          )
        ) as comments
      FROM events e
      LEFT JOIN event_categories ec ON e.id_category = ec.id_category
      LEFT JOIN departments d ON e.id_department = d.id_department
      LEFT JOIN event_attachments ea ON e.id_event = ea.id_event
      LEFT JOIN event_participants ep ON e.id_event = ep.id_event
      LEFT JOIN users u ON ep.id_user = u.id_user
      LEFT JOIN comments c ON e.id_event = c.id_event
      LEFT JOIN users au ON c.id_author = au.id_user
      WHERE e.id_event = $1
      GROUP BY e.id_event, ec.id_category, d.id_department
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  static async create(eventData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const { rows } = await client.query(
        `INSERT INTO events (
          event_name, description, start_datetime, end_datetime, 
          location, id_category, status, id_department
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id_event`,
        [
          eventData.event_name,
          eventData.description,
          eventData.start_datetime,
          eventData.end_datetime,
          eventData.location,
          eventData.id_category,
          eventData.status || 'planned',
          eventData.id_department
        ]
      );
      
      const eventId = rows[0].id_event;
      
      // Добавляем участников
      if (eventData.participants && eventData.participants.length > 0) {
        await client.query(
          `INSERT INTO event_participants (
            id_event, id_user, participant_role, participation_status
          ) VALUES ${eventData.participants
            .map((_, i) => `($1, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
            .join(',')}`,
          [
            eventId,
            ...eventData.participants.flatMap(p => [
              p.id_user,
              p.participant_role,
              p.participation_status || 'registered'
            ])
          ]
        );
      }
      
      // Добавляем вложения
      if (eventData.attachments && eventData.attachments.length > 0) {
        await client.query(
          `INSERT INTO event_attachments (
            id_event, attachment_name, file_path, file_type, file_size
          ) VALUES ${eventData.attachments
            .map((_, i) => `($1, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
            .join(',')}`,
          [
            eventId,
            ...eventData.attachments.flatMap(a => [
              a.attachment_name,
              a.file_path,
              a.file_type,
              a.file_size
            ])
          ]
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

  static async update(id, eventData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Обновляем основную информацию о событии
      await client.query(
        `UPDATE events SET
          event_name = $1,
          description = $2,
          start_datetime = $3,
          end_datetime = $4,
          location = $5,
          id_category = $6,
          status = $7,
          id_department = $8
        WHERE id_event = $9`,
        [
          eventData.event_name,
          eventData.description,
          eventData.start_datetime,
          eventData.end_datetime,
          eventData.location,
          eventData.id_category,
          eventData.status,
          eventData.id_department,
          id
        ]
      );
      
      // Удаляем старых участников и добавляем новых
      await client.query(
        'DELETE FROM event_participants WHERE id_event = $1',
        [id]
      );
      
      if (eventData.participants && eventData.participants.length > 0) {
        await client.query(
          `INSERT INTO event_participants (
            id_event, id_user, participant_role, participation_status
          ) VALUES ${eventData.participants
            .map((_, i) => `($1, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
            .join(',')}`,
          [
            id,
            ...eventData.participants.flatMap(p => [
              p.id_user,
              p.participant_role,
              p.participation_status || 'registered'
            ])
          ]
        );
      }
      
      // Удаляем старые вложения (файлы физически не удаляются)
      await client.query(
        'DELETE FROM event_attachments WHERE id_event = $1',
        [id]
      );
      
      // Добавляем новые вложения
      if (eventData.attachments && eventData.attachments.length > 0) {
        await client.query(
          `INSERT INTO event_attachments (
            id_event, attachment_name, file_path, file_type, file_size
          ) VALUES ${eventData.attachments
            .map((_, i) => `($1, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
            .join(',')}`,
          [
            id,
            ...eventData.attachments.flatMap(a => [
              a.attachment_name,
              a.file_path,
              a.file_type,
              a.file_size
            ])
          ]
        );
      }
      
      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async delete(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM events WHERE id_event = $1',
      [id]
    );
    return rowCount > 0;
  }
}

module.exports = Event;