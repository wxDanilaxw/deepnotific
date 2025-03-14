import React, { useState, useEffect } from "react";
import axios from "axios";
import TodoList from "./TodoList";
import FavoriteList from "./FavoriteList";
import "./work_list.css";

const WorkList = ({
  onEventClick,
  currentDate,
  onDateSelect,
  isCalendarOpen,
  toggleCalendar,
}) => {
  const [todos, setTodos] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Загрузка событий при изменении currentDate
  useEffect(() => {
    fetchEvents(currentDate);
  }, [currentDate]);

  // Загрузка избранного из localStorage при монтировании компонента
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, []);

  // Функция для загрузки событий
  const fetchEvents = async (date) => {
    try {
      const adjustedDate = new Date(date);
      adjustedDate.setDate(adjustedDate.getDate());
      const formattedDate = adjustedDate.toISOString().split("T")[0];

      const response = await axios.get(
        `http://localhost:3000/events?event_date=${formattedDate}`
      );

      // Обработка данных: добавляем isFavorite, если его нет
      const events = response.data.map((event) => ({
        ...event,
        isFavorite: event.isFavorite || false,
        date: event.date || formattedDate,
      }));

      setTodos(events);
      restoreFavorites(events); // Восстанавливаем избранное
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  // Переключение избранного
  const toggleFavorite = (id) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, isFavorite: !todo.isFavorite } : todo
    );

    const todo = updatedTodos.find((todo) => todo.id === id);
    if (!todo) return; // Если todo не найден, выходим

    if (todo.isFavorite) {
      setFavorites((prevFavorites) => [...prevFavorites, todo]);
    } else {
      setFavorites((prevFavorites) =>
        prevFavorites.filter((fav) => fav.id !== id)
      );
    }

    setTodos(updatedTodos);
    saveFavorites();
  };

  // Сохранение избранного в localStorage
  const saveFavorites = () => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  // Восстановление избранного
  const restoreFavorites = (events) => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // Обновляем todos, чтобы отобразить избранные элементы
    const updatedTodos = events.map((event) => {
      const isFavorite = storedFavorites.some((fav) => fav.id === event.id);
      return { ...event, isFavorite };
    });

    setTodos(updatedTodos);
  };

  // Переход к предыдущему дню
  const goToPreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateSelect(previousDay);
  };

  // Переход к следующему дню
  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateSelect(nextDay);
  };

  return (
    <div className="app">
      <div className="button-group">
        <button
          className={`list-button ${!showFavorites ? "active" : ""}`}
          onClick={() => setShowFavorites(false)}
        >
          Список
        </button>
        <button
          className={`favorite-button ${showFavorites ? "active" : ""}`}
          onClick={() => setShowFavorites(true)}
        >
          Избранное
        </button>
      </div>

      <div className="date-navigation">
        <button className="left-date-button" onClick={goToPreviousDay}></button>
        <div className="text-button-date" onClick={toggleCalendar}>
          {currentDate.toLocaleDateString("ru-RU")}
        </div>
        <button className="right-date-button" onClick={goToNextDay}></button>
      </div>

      {showFavorites ? (
        <FavoriteList
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onEventClick={onEventClick}
        />
      ) : (
        <TodoList
          todos={todos}
          onToggleFavorite={toggleFavorite}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
};

export default WorkList;
