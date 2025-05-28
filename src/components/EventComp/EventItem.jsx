import React from 'react';
import { format } from 'date-fns';
import './EventItem.css';
const EventItem = ({ event, categories, departments, onEdit, onDelete }) => {
  const category = categories.find(c => c.id_category === event.id_category);
  const department = departments.find(d => d.id_department === event.id_department);

  return (
    <div className="event-card">
      <div className="event-info">
        <h3>{event.event_name}</h3>
        <p>{event.description}</p>
        
        <div className="event-details">
          <div>
            <strong>Дата начала:</strong> {format(new Date(event.start_datetime), 'dd.MM.yyyy HH:mm')}
          </div>
          <div>
            <strong>Дата окончания:</strong> {format(new Date(event.end_datetime), 'dd.MM.yyyy HH:mm')}
          </div>
          <div>
            <strong>Место:</strong> {event.location}
          </div>
          <div>
            <strong>Категория:</strong> {category?.category_name || 'Не указана'}
          </div>
          <div>
            <strong>Отдел:</strong> {department?.department_name || 'Не указан'}
          </div>
          <div>
            <strong>Статус:</strong> {event.status}
          </div>
        </div>
      </div>
      
      <div className="event-actions">
        <button onClick={() => onEdit(event)}>Редактировать</button>
        <button onClick={() => onDelete(event)}>Удалить</button>
      </div>
    </div>
  );
};

export default EventItem;