import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "./Calendar";
import WorkList from "../components/work_list";
import "./main.css";
import LoginModal from "../components/LoginModal";
import EventDetailModal from "../components/EventDetailModal";
import CreateEventModal from "../components/CreateEventModal";

const Main = () => {
  // Состояния для авторизации
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");

  // Состояния для событий
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Состояния для модальных окон
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Состояния для дат
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Состояние для выпадающего меню
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  // Проверка авторизации при загрузке
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllEvents();
    }
  }, [isAuthenticated]);

  // Закрытие выпадающего меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Функции для модальных окон
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openEventDetailModal = (event) => {
    setSelectedEvent(event);
    setIsEventDetailModalOpen(true);
  };

  const closeEventDetailModal = () => setIsEventDetailModalOpen(false);

  const openCreateEventModal = () => setIsCreateEventModalOpen(true);
  const closeCreateEventModal = () => setIsCreateEventModalOpen(false);

  // Обработчик успешного входа
  const handleLoginSuccess = (response) => {
    const { user } = response;
    
    setIsAuthenticated(true);
    setUsername(user.login_users);
    setUserRole(user.user_role);
    closeModal();

    // Сохраняем в localStorage
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("username", user.login_users);
    localStorage.setItem("userRole", user.user_role);

    // Загружаем события
    fetchAllEvents();
  };

  // Обработчик выхода
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setUserRole("");
    setEvents([]);

    // Очищаем localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
  };

  // Загрузка событий
  const fetchAllEvents = async () => {
    try {
      const response = await fetch("http://localhost:3000/events");
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  };

  // Обработчик создания события
  const handleEventCreated = () => {
    fetchAllEvents();
    closeCreateEventModal();
  };

  // Обработчик выбора даты
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  // Фильтрация событий для выбранной даты
  const getEventsForSelectedDate = () => {
    if (!selectedDate || !Array.isArray(events)) return [];
    
    const dateStr = selectedDate.toISOString().split("T")[0];
    return events.filter((event) => {
      const eventDate = event.start_date || event.event_date;
      return eventDate.split("T")[0] === dateStr;
    });
  };

  // Переключение календаря
  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  // Переход в админ-панель
  const goToAdminPanel = () => navigate("/adminpanel");

  return (
    <main>
      <div className="main-content">
        {/* Кнопка входа/меню пользователя */}
        {!isAuthenticated ? (
          <button className="join-button" onClick={openModal}>
            Вход
          </button>
        ) : (
          <div className="user-controls">
            <div className="dropdown" ref={dropdownRef}>
              <button className="dropbtn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {username}
              </button>
              {isDropdownOpen && (
                <div className="dropdown-content">
                  <a href="#" onClick={handleLogout}>Выйти</a>
                </div>
              )}
            </div>

            {userRole === "admin" && (
              <button className="admin-panel-button" onClick={goToAdminPanel}>
                Админ-панель
              </button>
            )}
          </div>
        )}

        {/* Модальное окно авторизации */}
        <LoginModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onLoginSuccess={handleLoginSuccess}
        />

        {/* Основной контент для авторизованных пользователей */}
        {isAuthenticated && (
          <div className="content-area">
            <button className="calendar-button" onClick={toggleCalendar}>
              Календарь событий
            </button>

            <div className="margin-Worklist">
              <WorkList
                onEventClick={openEventDetailModal}
                currentDate={selectedDate}
                onDateSelect={handleDateSelect}
                isCalendarOpen={isCalendarOpen}
                toggleCalendar={toggleCalendar}
                events={getEventsForSelectedDate()}
              />
            </div>

            {/* Календарь */}
            {isCalendarOpen && (
              <div className="calendar-overlay">
                <div className="overlay" onClick={toggleCalendar}></div>
                <div className="calendar-container">
                  <Calendar
                    currentDate={currentDate}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    events={events}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Модальные окна событий */}
        <EventDetailModal
          isOpen={isEventDetailModalOpen}
          onClose={closeEventDetailModal}
          event={selectedEvent}
        />

        <CreateEventModal
          isOpen={isCreateEventModalOpen}
          onRequestClose={closeCreateEventModal}
          onEventCreated={handleEventCreated}
        />
      </div>
    </main>
  );
};

export default Main;