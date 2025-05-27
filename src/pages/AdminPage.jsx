import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import "./AdminPage.css";
import CreateEventModal from "../components/CreateEventModal";
import EditEventModal from "../components/EditEventModal";
import EventsPage from '../components/EventComp/EventsPage';
import { Link } from 'react-router-dom';
const AdminPage = () => {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  

  

  

 

  return (
    <div className="admin-container">
      <div className="header-section">
        <h1 className="admin-title">Панель администратора</h1>
        <Link to="/adminpanel/events" className="admin-menu-item">
          Управление событиями
        </Link>

        <button onClick={() => navigate("/")} className="close-panel-button">
          Закрыть панель
        </button>
      </div>

      <div className="action-bar">
        <button
          className="create-event-button"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Создать событие
        </button>
      </div>

      <div className="event-list">
        <div className="list-header">
          <h2 className="event-title">Список событий</h2>
          <span className="event-count">{events.length} событий</span>
        </div>

        {events.length === 0 ? (
          <div className="empty-list">Нет доступных событий</div>
        ) : (
          <ul className="none-ul">
            {events.map((event) => (
              <div className="all-items" key={event.id}>
                <div className="elem-description">
                  <li>
                    <div className="event-main-info">
                      <strong className="event-name">{event.title}</strong>
                      <span
                        className={`event-status ${
                          event.status ? "active" : "inactive"
                        }`}
                      >
                        {event.status ? "Активно" : "Неактивно"}
                      </span>
                    </div>

                    <div className="event-details">
                      <p>
                        <strong>Тип:</strong> {event.event_type}
                      </p>
                      <p>
                        <strong>Вид:</strong> {event.event_kind}
                      </p>
                      <p>
                        <strong>Дата начала:</strong>{" "}
                        {format(new Date(event.start_date), "dd-MM-yyyy")}
                      </p>
                      <p>
                        <strong>Дата окончания:</strong>{" "}
                        {format(new Date(event.end_date), "dd-MM-yyyy")}
                      </p>
                      <p>
                        <strong>Отделы:</strong>{" "}
                        {event.departments?.join(", ") || "Не указаны"}
                      </p>
                    </div>

                    <div className="button-group">
                      <button
                        className="button-event-edit"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Редактировать
                      </button>
                      <button
                        className="button-event-edit delete"
                       
                      >
                        Удалить
                      </button>
                    </div>
                  </li>
                </div>
                <div className="description-event">
                  <strong>Описание:</strong>
                  <p>{event.description || "Нет описания"}</p>
                </div>
              </div>
            ))}
          </ul>
        )}
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onRequestClose={() => setIsCreateModalOpen(false)}
       
        departments={departments}
      />

      {selectedEvent && (
        <EditEventModal
          isOpen={isEditModalOpen}
          onRequestClose={() => setIsEditModalOpen(false)}
         
          event={selectedEvent}
          departments={departments}
        />
      )}
    </div>
  );
};

export default AdminPage;
