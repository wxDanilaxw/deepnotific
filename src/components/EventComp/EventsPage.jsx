import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents, deleteEvent, fetchCategories, fetchDepartments } from '../../api/eventApi';

import EventItem from './EventItem';
import EventModal from './EventModal';
import EditEventModal from './EditEventModal';
import DeleteEventModal from './DeleteEventModal';
import './styles.css';


const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, categoriesData, departmentsData] = await Promise.all([
        fetchEvents(),
        fetchCategories().catch(() => []), // Возвращаем пустой массив при ошибке
        fetchDepartments().catch(() => []) // Возвращаем пустой массив при ошибке
      ]);
      setEvents(eventsData);
      setCategories(categoriesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      // Можно добавить уведомление пользователю
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEvent(deletingEvent.id_event);
      loadData();
      setDeletingEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
  
        <div className="admin-container">
          <Link to="/" className="back-button">← На главную</Link>
          
          <div className="header-section">
            <h2 className="admin-title">Управление событиями</h2>
            <div className="event-count">Всего событий: {events.length}</div>
            <button className="create-event-button" onClick={() => setIsCreateModalOpen(true)}>
              Создать событие
            </button>
          </div>
      
          <div className="event-list">
            {events.map(event => (
              <EventItem 
                key={event.id_event} 
                event={event} 
                categories={categories}
                departments={departments}
                onEdit={setEditingEvent} 
                onDelete={setDeletingEvent} 
              />
            ))}
          </div>
      
          {isCreateModalOpen && (
            <EventModal 
              categories={categories}
              departments={departments}
              onClose={() => setIsCreateModalOpen(false)} 
              onSuccess={loadData} 
            />
          )}
      
          {editingEvent && (
            <EditEventModal 
              event={editingEvent}
              categories={categories}
              departments={departments}
              onClose={() => setEditingEvent(null)} 
              onSuccess={loadData} 
            />
          )}
      
          {deletingEvent && (
            <DeleteEventModal 
              event={deletingEvent} 
              onClose={() => setDeletingEvent(null)} 
              onConfirm={handleDeleteConfirm} 
            />
          )}
        </div>
      );
      
  
};

export default EventsPage;