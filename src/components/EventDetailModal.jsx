import React, { useState, useEffect } from "react";
import "./EventDetail.css";

const EventDetailModal = ({ isOpen, onClose, event }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (isVisible) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible || !event) return null;

  return (
    <div
      className={`event-detail-modal-overlay ${
        isVisible && !isClosing ? "visible" : ""
      }`}
      onClick={handleClose}
    >
      <div
        className={`event-detail-modal-content ${isClosing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{event.title}</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="event-detail-grid">
            <div className="form-group">
              <label className="form-label">Описание:</label>
              <p className="form-control-static">{event.description}</p>
            </div>

            <div className="form-row">
              <div className="form-group form-col">
                <label className="form-label">Тип мероприятия:</label>
                <p className="form-control-static">{event.event_type}</p>
              </div>
              <div className="form-group form-col">
                <label className="form-label">Вид мероприятия:</label>
                <p className="form-control-static">{event.event_kind}</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-col">
                <label className="form-label">Дата начала:</label>
                <p className="form-control-static">
                  {formatDate(event.start_date)}
                </p>
              </div>
              <div className="form-group form-col">
                <label className="form-label">Дата окончания:</label>
                <p className="form-control-static">
                  {formatDate(event.end_date)}
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Статус:</label>
              <p className="form-control-static">
                {event.status ? "Активен" : "Неактивен"}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Отделы:</label>
              <div className="form-control-static">
                {event.departments.join(", ")}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Пользователи для уведомления:
              </label>
              <div className="form-control-static">
                {event.notified_users.join(", ")}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleClose}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
