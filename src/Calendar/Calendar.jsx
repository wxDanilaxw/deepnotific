import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Calendar.css";

const Calendar = ({ currentDate, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  );
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Получаем события для текущего месяца
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0];
      const lastDay = new Date(year, month, 0).toISOString().split("T")[0];

      const response = await axios.get(
        `http://localhost:3001/events?start_date=${firstDay}&end_date=${lastDay}`
      );

      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Ошибка загрузки событий");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  // Проверяем, есть ли события на конкретную дату
  const hasEvents = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.some(
      (event) =>
        event.start_date.includes(dateStr) || event.end_date.includes(dateStr)
    );
  };

  // Получаем события для выбранной даты
  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return events.filter(
      (event) =>
        event.start_date.includes(dateStr) || event.end_date.includes(dateStr)
    );
  };

  // Навигация по месяцам
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === "prev" ? -1 : 1));
    setCurrentMonth(newMonth);
  };

  // Генерация дней месяца
  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const hasEvent = hasEvents(date);

      days.push(
        <div
          key={`day-${day}`}
          className={`calendar-day 
            ${isSelected ? "selected" : ""} 
            ${hasEvent ? "has-event" : ""}
          `}
          onClick={() => onDateSelect(date)}
        >
          {day}
          {hasEvent && <div className="event-dot"></div>}
        </div>
      );
    }

    return days;
  };

  // Названия месяцев
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

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={() => navigateMonth("prev")}>&lt;</button>
        <h2>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button onClick={() => navigateMonth("next")}>&gt;</button>
      </div>

      <div className="calendar-weekdays">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-days-grid">{renderDays()}</div>

      {selectedDate && (
        <div className="calendar-events-panel">
          <h3>
            {selectedDate.toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>

          {getEventsForDate(selectedDate).length > 0 ? (
            <ul className="events-list">
              {getEventsForDate(selectedDate).map((event) => (
                <li key={event.id} className="event-item">
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                  <div className="event-time">
                    {new Date(event.start_date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(event.end_date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="event-type">{event.event_type}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-events">Нет событий на эту дату</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;
