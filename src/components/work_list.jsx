import React, { useState, useEffect } from 'react'
import axios from 'axios'
import TodoList from './TodoList'
import FavoriteList from './FavoriteList'
import './work_list.css'

const WorkList = ({
	onEventClick,
	currentDate,
	onDateSelect,
	isCalendarOpen,
	toggleCalendar,
}) => {
	const [todos, setTodos] = useState([])
	const [favorites, setFavorites] = useState([])
	const [showFavorites, setShowFavorites] = useState(false)

	useEffect(() => {
		fetchEvents(currentDate)
		restoreFavorites()
	}, [currentDate])

	const fetchEvents = async date => {
		try {
			// Вычитаем один день из текущей даты
			const adjustedDate = new Date(date)
			adjustedDate.setDate(adjustedDate.getDate() + 0)
			const formattedDate = adjustedDate.toISOString().split('T')[0] // Форматируем дату в формат YYYY-MM-DD
			const response = await axios.get(
				`http://localhost:3000/events?start_date=${formattedDate}`
			)
			const events = response.data.map(event => ({
				...event,
				isFavorite: false, // Добавляем поле isFavorite в данные
				date: event.date || formattedDate, // Добавляем дату, если она отсутствует
			}))
			setTodos(events)
		} catch (error) {
			console.error('Error fetching events', error)
		}
	}

	const toggleFavorite = index => {
		if (index < 0 || index >= todos.length) {
			console.error('Invalid index:', index)
			return
		}

		const updatedTodos = [...todos]
		const todo = updatedTodos[index]
		todo.isFavorite = !todo.isFavorite

		if (todo.isFavorite) {
			setFavorites([...favorites, todo])
		} else {
			setFavorites(favorites.filter(fav => fav.id !== todo.id))
		}

		setTodos(updatedTodos)
		saveFavorites()
	}

	const goToPreviousDay = () => {
		const previousDay = new Date(currentDate)
		previousDay.setDate(previousDay.getDate() - 1)
		onDateSelect(previousDay)
	}

	const goToNextDay = () => {
		const nextDay = new Date(currentDate)
		nextDay.setDate(nextDay.getDate() + 1)
		onDateSelect(nextDay)
	}

	const saveFavorites = () => {
		localStorage.setItem('favorites', JSON.stringify(favorites))
	}

	const restoreFavorites = () => {
		const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || []
		setFavorites(storedFavorites)

		// Обновляем состояние todos, чтобы отобразить избранные элементы
		const updatedTodos = todos.map(todo => {
			const isFavorite = storedFavorites.some(fav => fav.id === todo.id)
			return { ...todo, isFavorite }
		})
		setTodos(updatedTodos)
	}

	return (
		<div className='app'>
			<div className='button-group'>
				<button
					className={`list-button ${!showFavorites ? 'active' : ''}`}
					onClick={() => setShowFavorites(false)}
				>
					Список
				</button>
				<button
					className={`favorite-button ${showFavorites ? 'active' : ''}`}
					onClick={() => setShowFavorites(true)}
				>
					Избранное
				</button>
			</div>
			<div className='date-navigation'>
				<button className='left-date-button' onClick={goToPreviousDay}></button>
				<div className='text-button-date' onClick={toggleCalendar}>
					{currentDate.toLocaleDateString('ru-RU')}
				</div>
				<button className='right-date-button' onClick={goToNextDay}></button>
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
	)
}

export default WorkList
