import React, { useState, useEffect } from "react";
import "./EventDetail.css";
import axios from "axios";

const EventDetailModal = ({ isOpen, onClose, event, userRole }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [fullEventData, setFullEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      setIsVisible(true);
      setIsClosing(false);
      fetchFullEventData();
    } else if (isVisible) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setFullEventData(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible, event]);

  const fetchFullEventData = async () => {
    if (!event?.id_event) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3000/api/events/${event.id_event}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFullEventData(response.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const displayData = fullEventData || event;

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
        {isLoading ? (
          <div className="loading-spinner">Загрузка...</div>
        ) : (
          <>
            <div className="modal-header">
              <h2 className="modal-title">{displayData.event_name || "Название не указано"}</h2>
              <button className="modal-close-btn" onClick={handleClose}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="event-detail-grid">
                <div className="form-group">
                  <label className="form-label">Описание:</label>
                  <p className="form-control-static">
                    {displayData.description || "Описание отсутствует"}
                  </p>
                </div>

                <div className="form-row">
                  <div className="form-group form-col">
                    <label className="form-label">Дата начала:</label>
                    <p className="form-control-static">
                      {formatDate(displayData.start_datetime)}
                    </p>
                  </div>
                  <div className="form-group form-col">
                    <label className="form-label">Дата окончания:</label>
                    <p className="form-control-static">
                      {formatDate(displayData.end_datetime)}
                    </p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group form-col">
                    <label className="form-label">Место проведения:</label>
                    <p className="form-control-static">
                      {displayData.location || "Не указано"}
                    </p>
                  </div>
                  <div className="form-group form-col">
                    <label className="form-label">Статус:</label>
                    <p className="form-control-static">
                      {displayData.status || "Не указан"}
                    </p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group form-col">
                    <label className="form-label">Категория:</label>
                    <p className="form-control-static">
                      {displayData.category_name || "Не указана"}
                    </p>
                  </div>
                  <div className="form-group form-col">
                    <label className="form-label">Отдел:</label>
                    <p className="form-control-static">
                      {displayData.department_name || "Не указан"}
                    </p>
                  </div>
                </div>

                {displayData.attachments?.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Вложения:</label>
                    <div className="form-control-static">
                      {displayData.attachments.map((attachment) => (
                        <div key={attachment.id_attachment}>
                          <a 
                            href={`http://localhost:3000/uploads/${attachment.file_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="attachment-link"
                          >
                            {attachment.attachment_name}
                          </a>
                          <span className="file-size">
                            ({Math.round(attachment.file_size / 1024)} KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {displayData.participants?.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Участники:</label>
                    <div className="participants-list">
                      {displayData.participants.map((participant) => (
                        <div key={participant.id_user} className="participant-item">
                          <span className="participant-name">
                            {participant.full_name}
                          </span>
                          <span className="participant-role">
                            ({participant.participant_role})
                          </span>
                          {participant.participation_status && (
                            <span className={`participation-status ${participant.participation_status}`}>
                              {participant.participation_status}
                            </span>
                          )}
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
                {userRole === 'admin' && (
                  <button className="btn btn-secondary">
                    Редактировать
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventDetailModal;