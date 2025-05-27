import React, { useState, useEffect } from 'react';
import { updateEvent } from '../../api/eventApi';

const EditEventModal = ({ event, categories, departments, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    event_name: event.event_name,
    description: event.description,
    start_datetime: formatForInput(event.start_datetime),
    end_datetime: formatForInput(event.end_datetime),
    location: event.location,
    id_category: event.id_category,
    id_department: event.id_department,
    status: event.status
  });

  function formatForInput(datetime) {
    if (!datetime) return '';
    const date = new Date(datetime);
    return date.toISOString().slice(0, 16);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateEvent(event.id_event, formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Редактировать событие</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название:</label>
            <input
              type="text"
              name="event_name"
              value={formData.event_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Описание:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Дата начала:</label>
            <input
              type="datetime-local"
              name="start_datetime"
              value={formData.start_datetime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Дата окончания:</label>
            <input
              type="datetime-local"
              name="end_datetime"
              value={formData.end_datetime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Место:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Категория:</label>
            <select
              name="id_category"
              value={formData.id_category}
              onChange={handleChange}
              required
            >
              {categories.map(category => (
                <option key={category.id_category} value={category.id_category}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Отдел:</label>
            <select
              name="id_department"
              value={formData.id_department}
              onChange={handleChange}
              required
            >
              {departments.map(department => (
                <option key={department.id_department} value={department.id_department}>
                  {department.department_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Статус:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="planned">Запланировано</option>
              <option value="completed">Завершено</option>
              <option value="canceled">Отменено</option>
            </select>
          </div>

          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;