import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "./Calendar";
import WorkList from "../components/work_list";
import "./main.css";
import LoginModal from "../components/LoginModal";
import EventDetailModal from "../components/EventDetailModal";
import CreateEventModal from "../components/CreateEventModal";

const Main = () => {
  // Состояния для модальных окон и аутентификации
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [fullName, setFullName] = useState(
    localStorage.getItem("fullName") || ""
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || ""
  );
  const [userDepartment, setUserDepartment] = useState(
    localStorage.getItem("userDepartment") || ""
  );

  // Состояния для событий
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Состояния для модальных окон
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Состояния для календаря
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Состояние для выпадающего меню
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  // Обработчики модального окна
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Обработчик успешного входа
  const handleLoginSuccess = (user) => {
    const { last_name, first_name, middle_name, role, department } = user;
    const formattedName = `${last_name} ${first_name[0]}.${middle_name[0]}.`;

    setIsAuthenticated(true);
    setFullName(formattedName);
    setUserRole(role);
    setUserDepartment(department);
    closeModal();

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("fullName", formattedName);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userDepartment", department);

    // Загружаем события после входа
    fetchAllEvents();
  };

  // Обработчик выхода
  const handleLogout = () => {
    setIsAuthenticated(false);
    setFullName("");
    setUserRole("");
    setUserDepartment("");
    setEvents([]);

    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("fullName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userDepartment");
  };

  // Управление календарем
  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  // Форматирование даты для запроса
  const getFormattedDate = (date) => {
    return date.toISOString().split("T")[0]; // Формат YYYY-MM-DD
  };

  // Обработчик выбора даты
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
    // Не нужно загружать события здесь - мы уже загрузили все
  };

  // Загрузка ВСЕХ событий (а не только для выбранной даты)
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

  // Загружаем события при аутентификации
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllEvents();
    }
  }, [isAuthenticated]);

  // Получаем события для выбранной даты
  const getEventsForSelectedDate = useMemo(() => {
    if (!selectedDate || !Array.isArray(events)) return [];

    const dateStr = getFormattedDate(selectedDate);
    return events.filter((event) => {
      const eventDateStr = event.start_date
        ? event.start_date.split("T")[0]
        : event.event_date.split("T")[0];
      return eventDateStr === dateStr;
    });
  }, [selectedDate, events]);

  // Обработчики модальных окон событий
  const openEventDetailModal = (event) => {
    setSelectedEvent(event);
    setIsEventDetailModalOpen(true);
  };

  const closeEventDetailModal = () => setIsEventDetailModalOpen(false);

  const openCreateEventModal = () => setIsCreateEventModalOpen(true);
  const closeCreateEventModal = () => {
    setIsCreateEventModalOpen(false);
  };

  const handleEventCreated = () => {
    fetchAllEvents(); // Перезагружаем все события после создания нового
  };

  // Управление админ-панелью
  const goToAdminPanel = () => {
    setIsAdminPanelOpen(true);
    navigate("/adminpanel");
  };

  const closeAdminPanel = () => {
    setIsAdminPanelOpen(false);
    navigate("/");
  };

  // Управление выпадающим меню
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Восстановление состояния при загрузке
  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
      setFullName(localStorage.getItem("fullName") || "");
      setUserRole(localStorage.getItem("userRole") || "");
      setUserDepartment(localStorage.getItem("userDepartment") || "");
      fetchAllEvents();
    }
  }, []);

  return (
    <main>
      <div className="main-content">
        {!isAuthenticated ? (
          <button className="join-button" onClick={openModal}>
            Вход
          </button>
        ) : (
          <div className="user-controls">
            <div className="dropdown" ref={dropdownRef}>
              <button className="dropbtn" onClick={toggleDropdown}>
                {fullName}
              </button>
              {isDropdownOpen && (
                <div className="dropdown-content">
                  <a href="#">Старый сайт</a>
                  <a href="#">Облако</a>
                  <a href="#">Карточка</a>
                  <a href="#">Портфолио</a>
                  <a href="#">Журнал</a>
                  <a href="#">Настройки</a>
                  <a onClick={handleLogout} href="#">
                    Выйти
                  </a>
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

        <LoginModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onLoginSuccess={handleLoginSuccess}
        />

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
                events={getEventsForSelectedDate} // Передаем только события для выбранной даты
              />
            </div>

            {isCalendarOpen && (
              <div className="calendar-overlay">
                <div className="overlay" onClick={toggleCalendar}></div>
                <div className="calendar-container">
                  <Calendar
                    currentDate={currentDate}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    events={events} // Передаем все события в календарь
                  />
                </div>
              </div>
            )}
          </div>
        )}

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

        {isAdminPanelOpen && (
          <div className="admin-panel">
            <button
              className="close-admin-panel-button"
              onClick={closeAdminPanel}
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Main;
