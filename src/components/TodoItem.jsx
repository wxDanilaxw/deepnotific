import React from 'react'
import './work_list.css'

const truncateText = (text, maxLength) => {
	if (text.length > maxLength) {
		return text.substring(0, maxLength) + '...'
	}
	return text
}

const TodoItem = ({ todo, index, onToggleFavorite, onEventClick }) => {
	const maxDescriptionLength = 70 // Максимальное количество символов

	// Проверка на наличие даты и форматирование её
	const formattedDate = todo.date
		? new Date(todo.date).toLocaleDateString()
		: 'Нет даты'

	// Дополнительное логирование для проверки данных
	console.log('TodoItem:', todo)
	console.log('Formatted Date:', formattedDate)

	return (
		<div
			className={`todo-item ${todo.isFavorite ? 'favorite' : ''}`}
			onClick={() => onEventClick(todo)}
		>
			<span className='span-description'>
				{truncateText(todo.description || 'Ничего', maxDescriptionLength)}
			</span>
			<div className='date-container'>
				<span className='date'>{formattedDate}</span>
				<button
					className={todo.isFavorite ? 'delete_to_favorite' : 'add_to_favorite'}
					onClick={e => {
						e.stopPropagation()
						onToggleFavorite(index)
					}}
				>
					{todo.isFavorite ? '' : ''}
				</button>
			</div>
		</div>
	)
}

export default TodoItem
