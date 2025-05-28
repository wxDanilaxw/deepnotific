import React, { useState } from 'react';
import { createEvent } from '../../api/eventApi';
import './EditEventModal.css'

const EventModal = ({ categories, departments, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    event_name: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    location: '',
    id_category: categories[0]?.id_category || '',
    id_department: departments[0]?.id_department || '',
    status: 'planned'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEvent(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="modal">
    <div className="modal-content">
      <h3>Создать событие</h3>
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
        <button type="submit">Создать</button>
      </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;