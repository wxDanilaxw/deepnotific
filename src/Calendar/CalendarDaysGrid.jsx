// src/components/Calendar/CalendarDaysGrid.js
import React from "react";
import "./CalendarDaysGrid.css";

const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const CalendarDaysGrid = ({
  currentDate,
  selectedDate,
  hasEvents,
  onDateSelect,
}) => {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // Генерация дней календаря
  const generateDays = () => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Дни предыдущего месяца
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <DayCell
          key={`prev-${day}`}
          day={day}
          isCurrentMonth={false}
          isSelected={false}
          hasEvent={false}
          onClick={() => {}}
        />
      );
    }

    // Дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected =
        selectedDate && selectedDate.toDateString() === date.toDateString();
      const hasEvent = hasEvents(date);

      days.push(
        <DayCell
          key={`current-${day}`}
          day={day}
          isCurrentMonth={true}
          isSelected={isSelected}
          hasEvent={hasEvent}
          onClick={() => onDateSelect(date)}
        />
      );
    }

    // Дни следующего месяца
    const totalCells = 42; // 6 недель
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <DayCell
          key={`next-${day}`}
          day={day}
          isCurrentMonth={false}
          isSelected={false}
          hasEvent={false}
          onClick={() => {}}
        />
      );
    }

    return days;
  };

  const DayCell = ({ day, isCurrentMonth, isSelected, hasEvent, onClick }) => (
    <div
      className={`day-cell 
        ${isCurrentMonth ? "current-month" : "other-month"} 
        ${isSelected ? "selected" : ""}
        ${hasEvent ? "has-event" : ""}
      `}
      onClick={onClick}
    >
      {day}
      {hasEvent && <div className="event-dot" />}
    </div>
  );

  return (
    <div className="calendar-grid">
      <div className="days-of-week">
        {daysOfWeek.map((day) => (
          <div key={day} className="day-of-week">
            {day}
          </div>
        ))}
      </div>
      <div className="days-grid">{generateDays()}</div>
    </div>
  );
};

export default CalendarDaysGrid;
