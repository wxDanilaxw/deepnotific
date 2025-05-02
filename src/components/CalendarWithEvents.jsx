import React, { useState, useEffect } from "react";
import Calendar from "./Calendar";
import WorkList from "./WorkList";
import axios from "axios";

const CalendarWithEvents = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);

  // Загрузка событий при монтировании и при изменении месяца
  useEffect(() => {
    fetchEvents();
  }, [currentDate.getMonth()]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:3000/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (currentDate.getMonth() !== date.getMonth()) {
      setCurrentDate(date);
    }
  };

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  return (
    <div className="app-container">
      {isCalendarOpen && (
        <Calendar
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          events={events}
        />
      )}
      <WorkList
        onEventClick={() => {}}
        currentDate={selectedDate}
        onDateSelect={handleDateSelect}
        isCalendarOpen={isCalendarOpen}
        toggleCalendar={toggleCalendar}
      />
    </div>
  );
};

export default CalendarWithEvents;
