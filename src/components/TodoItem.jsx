import React from 'react';
import './work_list.css';

const TodoItem = ({ todo, onToggleFavorite, onEventClick }) => {
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formattedDate = todo.start_datetime 
    ? new Date(todo.start_datetime).toLocaleDateString('ru-RU')
    : 'Нет даты';

  return (
    <div
      className={`todo-item ${todo.isFavorite ? 'favorite' : ''}`}
      onClick={() => onEventClick(todo)}
    >
      <span className='span-description'>
        {truncateText(todo.event_name || 'Нет названия', 70)}
      </span>
      <div className='date-container'>
        <span className='date'>{formattedDate}</span>
        <button
          className={todo.isFavorite ? 'delete_to_favorite' : 'add_to_favorite'}
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite(todo.id_event);
          }}
        >
          {todo.isFavorite ? '' : ''}
        </button>
      </div>
    </div>
  );
};

export default TodoItem;