import React from 'react'
import TodoItem from './TodoItem'

const TodoList = ({ todos, onToggleFavorite, onEventClick }) => {
	return (
		<div className='todo-list'>
			{todos.map((todo, index) => (
				<TodoItem
					key={todo.id}
					todo={todo}
					index={index}
					onToggleFavorite={onToggleFavorite}
					onEventClick={onEventClick}
				/>
			))}
		</div>
	)
}

export default TodoList
