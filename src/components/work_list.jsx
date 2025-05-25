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
  events,
  userRole
}) => {
  const [todos, setTodos] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    if (events) {
      const eventsWithFavorites = events.map(event => ({
        ...event,
        isFavorite: favorites.some(fav => fav.id_event === event.id_event)
      }));
      setTodos(eventsWithFavorites);
    }
  }, [events, favorites]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, []);

  const toggleFavorite = (id) => {
    const updatedTodos = todos.map((todo) =>
      todo.id_event === id ? { ...todo, isFavorite: !todo.isFavorite } : todo
    );

    const todo = updatedTodos.find((todo) => todo.id_event === id);
    if (!todo) return;

    if (todo.isFavorite) {
      setFavorites((prevFavorites) => [...prevFavorites, todo]);
    } else {
      setFavorites((prevFavorites) =>
        prevFavorites.filter((fav) => fav.id_event !== id)
      );
    }

    setTodos(updatedTodos);
    saveFavorites();
  };

  const saveFavorites = () => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateSelect(previousDay);
  };

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
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default WorkList;