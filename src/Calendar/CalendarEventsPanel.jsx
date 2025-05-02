// src/components/Calendar/CalendarEventsPanel.js
import React from "react";
import "./CalendarEventsPanel.css";

const CalendarEventsPanel = ({
  activeTab,
  onTabChange,
  selectedDate,
  dateEvents,
  dateLoading,
  dateError,
  announcements,
  announcementsLoading,
  announcementsError,
}) => {
  return (
    <div className="events-panel">
      <div className="panel-tabs">
        <button
          className={`tab ${activeTab === "events" ? "active" : ""}`}
          onClick={() => onTabChange("events")}
          disabled={!selectedDate}
        >
          Мероприятия
        </button>
        <button
          className={`tab ${activeTab === "announcements" ? "active" : ""}`}
          onClick={() => onTabChange("announcements")}
        >
          Объявления
        </button>
      </div>

      <div className="panel-content">
        {activeTab === "events" ? (
          <EventsList
            selectedDate={selectedDate}
            events={dateEvents}
            loading={dateLoading}
            error={dateError}
          />
        ) : (
          <AnnouncementsList
            announcements={announcements}
            loading={announcementsLoading}
            error={announcementsError}
          />
        )}
      </div>
    </div>
  );
};

const EventsList = ({ selectedDate, events, loading, error }) => {
  if (!selectedDate) {
    return (
      <div className="panel-message">
        Выберите дату для просмотра мероприятий
      </div>
    );
  }

  if (loading) {
    return <div className="panel-message">Загрузка...</div>;
  }

  if (error) {
    return <div className="panel-error">Ошибка загрузки мероприятий</div>;
  }

  return (
    <>
      <h3 className="panel-title">
        {selectedDate.toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </h3>
      {events?.length > 0 ? (
        <ul className="events-list">
          {events.map((event) => (
            <li key={event.id} className="event-item">
              <h4>{event.title}</h4>
              <p>{event.description}</p>
              <div className="event-meta">
                <span>{event.event_kind}</span>
                <span>
                  {new Date(event.event_date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel-message">Нет мероприятий на выбранную дату</div>
      )}
    </>
  );
};

const AnnouncementsList = ({ announcements, loading, error }) => {
  if (loading) {
    return <div className="panel-message">Загрузка объявлений...</div>;
  }

  if (error) {
    return <div className="panel-error">Ошибка загрузки объявлений</div>;
  }

  return (
    <>
      <h3 className="panel-title">Актуальные объявления</h3>
      {announcements?.length > 0 ? (
        <ul className="announcements-list">
          {announcements.map((announcement) => (
            <li key={announcement.id} className="announcement-item">
              <h4>{announcement.title}</h4>
              <p>{announcement.description}</p>
              <div className="announcement-date">
                {new Date(announcement.event_date).toLocaleDateString("ru-RU")}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel-message">Нет актуальных объявлений</div>
      )}
    </>
  );
};

export default CalendarEventsPanel;
