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
    if (!dateString) return "Не указано";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
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
          <h2 className="modal-title">{event.event_name || "Название не указано"}</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="event-detail-grid">
            <div className="form-group">
              <label className="form-label">Описание:</label>
              <p className="form-control-static">
                {event.description || "Описание отсутствует"}
              </p>
            </div>

            <div className="form-row">
              <div className="form-group form-col">
                <label className="form-label">Дата начала:</label>
                <p className="form-control-static">
                  {formatDate(event.start_datetime)}
                </p>
              </div>
              <div className="form-group form-col">
                <label className="form-label">Дата окончания:</label>
                <p className="form-control-static">
                  {formatDate(event.end_datetime)}
                </p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-col">
                <label className="form-label">Место проведения:</label>
                <p className="form-control-static">
                  {event.location || "Не указано"}
                </p>
              </div>
              <div className="form-group form-col">
                <label className="form-label">Статус:</label>
                <p className="form-control-static">
                  {event.status || "Не указан"}
                </p>
              </div>
            </div>

            {event.category_name && (
              <div className="form-row">
                <div className="form-group form-col">
                  <label className="form-label">Категория:</label>
                  <p className="form-control-static">
                    {event.category_name}
                  </p>
                </div>
                {event.department_name && (
                  <div className="form-group form-col">
                    <label className="form-label">Отдел:</label>
                    <p className="form-control-static">
                      {event.department_name}
                    </p>
                  </div>
                )}
              </div>
            )}

            {event.attachments && event.attachments.length > 0 && (
              <div className="form-group">
                <label className="form-label">Вложения:</label>
                <div className="form-control-static">
                  {event.attachments.map((attachment) => (
                    <div key={attachment.id_attachment}>
                      <a 
                        href={`http://localhost:3000/uploads/${attachment.file_path}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {attachment.attachment_name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.participants && event.participants.length > 0 && (
              <div className="form-group">
                <label className="form-label">Участники:</label>
                <div className="form-control-static">
                  {event.participants.map((participant) => (
                    <div key={participant.id_user}>
                      {participant.full_name} ({participant.participant_role})
                    </div>
                  ))}
                </div>
              </div>
            )}
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