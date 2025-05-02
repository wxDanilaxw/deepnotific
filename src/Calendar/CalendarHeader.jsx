// src/components/Calendar/CalendarHeader.js
import React, { useState } from "react";
import "./CalendarHeader.css";

const months = [
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

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth }) => {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const goToMonth = (monthIndex) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    onMonthChange(newDate);
    setShowMonthPicker(false);
  };

  const goToYear = (year) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    onMonthChange(newDate);
    setShowYearPicker(false);
  };

  const generateYears = () => {
    const currentYear = currentDate.getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  const onMonthChange = (newDate) => {
    // Здесь можно добавить callback для изменения месяца
    // Например, если нужно передать новую дату в родительский компонент
  };

  return (
    <div className="calendar-header">
      <button className="nav-button" onClick={onPrevMonth}>
        &lt;
      </button>

      <div className="month-year-selector">
        <button
          className="month-selector"
          onClick={() => {
            setShowMonthPicker(!showMonthPicker);
            setShowYearPicker(false);
          }}
        >
          {months[currentDate.getMonth()]}
        </button>

        <button
          className="year-selector"
          onClick={() => {
            setShowYearPicker(!showYearPicker);
            setShowMonthPicker(false);
          }}
        >
          {currentDate.getFullYear()}
        </button>

        {showMonthPicker && (
          <div className="month-picker">
            {months.map((month, index) => (
              <div
                key={month}
                className={`month-option ${
                  index === currentDate.getMonth() ? "selected" : ""
                }`}
                onClick={() => goToMonth(index)}
              >
                {month}
              </div>
            ))}
          </div>
        )}

        {showYearPicker && (
          <div className="year-picker">
            {generateYears().map((year) => (
              <div
                key={year}
                className={`year-option ${
                  year === currentDate.getFullYear() ? "selected" : ""
                }`}
                onClick={() => goToYear(year)}
              >
                {year}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="nav-button" onClick={onNextMonth}>
        &gt;
      </button>
    </div>
  );
};

export default CalendarHeader;
