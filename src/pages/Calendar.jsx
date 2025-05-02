import React, { useState, useCallback, useMemo } from "react";
import EventDetailModal from "../components/EventDetailModal";
import "./Calendar.css";

const Calendar = ({ events = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const normalizeDate = useCallback((dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }, []);

  const hasEvents = useCallback(
    (date) => {
      const normalizedDate = normalizeDate(date);
      if (!normalizedDate) return false;

      return events.some((event) => {
        const eventDate = normalizeDate(event.start_date || event.event_date);
        if (!eventDate) return false;

        return (
          eventDate.getFullYear() === normalizedDate.getFullYear() &&
          eventDate.getMonth() === normalizedDate.getMonth() &&
          eventDate.getDate() === normalizedDate.getDate()
        );
      });
    },
    [events, normalizeDate]
  );

  const getEventsForDate = useCallback(
    (date) => {
      const normalizedDate = normalizeDate(date);
      if (!normalizedDate) return [];

      return events.filter((event) => {
        const eventDate = normalizeDate(event.start_date || event.event_date);
        if (!eventDate) return false;

        return (
          eventDate.getFullYear() === normalizedDate.getFullYear() &&
          eventDate.getMonth() === normalizedDate.getMonth() &&
          eventDate.getDate() === normalizedDate.getDate()
        );
      });
    },
    [events, normalizeDate]
  );

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const generateCalendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const hasEvent = hasEvents(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={`day-${day}`}
          className={`calendar-day 
            ${isSelected ? "selected" : ""} 
            ${hasEvent ? "has-event" : ""}
            ${isToday ? "today" : ""}
          `}
          onClick={() => setSelectedDate(date)}
        >
          <span className="calendar-day-number">{day}</span>
          {isToday && <div className="today-indicator"></div>}
          {hasEvent && <div className="event-dot"></div>}
        </div>
      );
    }

    return days;
  }, [currentYear, currentMonth, selectedDate, hasEvents]);

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="calendar-container">
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={() => navigateMonth("prev")}>&larr;</button>
          <h2>
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button onClick={() => navigateMonth("next")}>&rarr;</button>
        </div>

        <div className="calendar-weekdays">
          {weekDays.map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">{generateCalendarDays}</div>
      </div>

      <div className="events-panel">
        <h3 className="title-event-panel">
          {selectedDate.toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h3>
        {getEventsForDate(selectedDate).length > 0 ? (
          <ul className="events-list">
            {getEventsForDate(selectedDate).map((event) => (
              <li
                key={event.id}
                className="event-item"
                onClick={() => handleEventClick(event)}
              >
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <div className="event-time">
                  {formatTime(event.start_date)}
                  {event.end_date && ` — ${formatTime(event.end_date)}`}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-events">Нет мероприятий на эту дату</div>
        )}
      </div>

      <EventDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        event={selectedEvent}
      />
    </div>
  );
};

export default Calendar;
