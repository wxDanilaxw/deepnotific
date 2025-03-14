import React, { useEffect, useState } from "react";
import TodoItem from "./TodoItem";
import "./work_list.css";

const FavoriteList = ({ favorites, onToggleFavorite, onEventClick }) => {
  // Состояние для хранения избранных элементов
  const [favoriteItems, setFavoriteItems] = useState(favorites);

  // Восстановление избранных элементов из localStorage при загрузке страницы
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavoriteItems(storedFavorites);
  }, []);

  // Сохранение избранных элементов в localStorage при изменении списка
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favoriteItems));
  }, [favoriteItems]);

  // Обработчик для добавления/удаления элемента из избранного
  const handleToggleFavorite = (index) => {
    const updatedFavorites = [...favoriteItems];
    const todo = updatedFavorites[index];
    todo.isFavorite = !todo.isFavorite;

    if (todo.isFavorite) {
      setFavoriteItems([...favoriteItems, todo]);
    } else {
      setFavoriteItems(favoriteItems.filter((fav) => fav.id !== todo.id));
    }

    onToggleFavorite(index);
  };

  return (
    <div className="favorite-list">
      {favoriteItems.map((todo, index) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          index={index}
          onToggleFavorite={handleToggleFavorite}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  );
};

export default FavoriteList;
