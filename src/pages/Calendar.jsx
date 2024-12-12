import React, { useState, useEffect } from 'react'
import './Calendar.css'

const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const Calendar = ({ currentDate, selectedDate, onDateSelect }) => {
	const month = currentDate.getMonth()
	const year = currentDate.getFullYear()
	const firstDayOfMonth = new Date(year, month, 1).getDay()
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const daysInPrevMonth = new Date(year, month, 0).getDate()

	const calendarDays = []

	const goToPreviousMonth = () => {
		const previousMonth = new Date(currentDate)
		previousMonth.setMonth(previousMonth.getMonth() - 1)
		onDateSelect(previousMonth)
	}

	const goToNextMonth = () => {
		const nextMonth = new Date(currentDate)
		nextMonth.setMonth(nextMonth.getMonth() + 1)
		onDateSelect(nextMonth)
	}

	// Заполняем дни предыдущего месяца
	for (let i = firstDayOfMonth - 1; i >= 0; i--) {
		calendarDays.push(
			<div key={`prev-${i}`} className='day prev-month'>
				{daysInPrevMonth - i}
			</div>
		)
	}

	// Заполняем дни текущего месяца
	for (let day = 1; day <= daysInMonth; day++) {
		const date = new Date(year, month, day)
		const isSelected =
			date.getFullYear() === selectedDate.getFullYear() &&
			date.getMonth() === selectedDate.getMonth() &&
			date.getDate() === selectedDate.getDate()
		calendarDays.push(
			<div
				key={day}
				className={`day ${isSelected ? 'selected' : ''}`}
				onClick={() => onDateSelect(date)}
			>
				{day}
			</div>
		)
	}

	// Заполняем дни следующего месяца, чтобы заполнить сетку
	const totalDays = 42 // 6 недель * 7 дней
	const daysToAdd = totalDays - calendarDays.length
	for (let i = 1; i <= daysToAdd; i++) {
		calendarDays.push(
			<div key={`next-${i}`} className='day next-month'>
				{i}
			</div>
		)
	}

	return (
		<div className='calendar'>
			<div className='header'>
				<button
					className='left-date-button'
					onClick={goToPreviousMonth}
				></button>
				<h2>
					{currentDate.toLocaleString('ru-RU', {
						month: 'long',
						year: 'numeric',
					})}
				</h2>
				<button className='right-date-button' onClick={goToNextMonth}></button>
			</div>
			<div className='days-of-week'>
				{daysOfWeek.map((day, index) => (
					<div key={index} className='day-of-week'>
						{day}
					</div>
				))}
			</div>
			<div className='days'>{calendarDays}</div>
		</div>
	)
}

export default Calendar
