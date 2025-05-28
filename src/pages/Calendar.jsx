import React, { useState, useCallback, useMemo, useEffect } from 'react'
import EventDetailModal from '../components/EventDetailModal'
import './Calendar.css'

const Calendar = ({ events = [] }) => {
	const [currentDate, setCurrentDate] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [activeTab, setActiveTab] = useState('events')
	const [selectedEvent, setSelectedEvent] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)

	// Добавляем состояние для заметок: объект { 'YYYY-MM-DD': 'текст заметки' }
	const [notes, setNotes] = useState({})

	// При загрузке читаем заметки из localStorage
	useEffect(() => {
		const savedNotes = localStorage.getItem('calendarNotes')
		if (savedNotes) {
			try {
				setNotes(JSON.parse(savedNotes))
			} catch {
				setNotes({})
			}
		}
	}, [])

	// Константы
	const monthNames = [
		'Январь',
		'Февраль',
		'Март',
		'Апрель',
		'Май',
		'Июнь',
		'Июль',
		'Август',
		'Сентябрь',
		'Октябрь',
		'Ноябрь',
		'Декабрь',
	]

	const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

	// Вспомогательные функции
	const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

	const getFirstDayOfMonth = (year, month) => {
		const day = new Date(year, month, 1).getDay()
		return day === 0 ? 6 : day - 1
	}

	const normalizeDate = useCallback(dateString => {
		if (!dateString) return null
		const date = new Date(dateString)
		return new Date(date.getFullYear(), date.getMonth(), date.getDate())
	}, [])

	// Проверка наличия событий
	const hasEvents = useCallback(
		date => {
			const normalizedDate = normalizeDate(date)
			if (!normalizedDate) return false

			return events.some(event => {
				const eventDate = normalizeDate(
					event.start_datetime || event.event_date
				)
				return (
					eventDate &&
					eventDate.getFullYear() === normalizedDate.getFullYear() &&
					eventDate.getMonth() === normalizedDate.getMonth() &&
					eventDate.getDate() === normalizedDate.getDate()
				)
			})
		},
		[events, normalizeDate]
	)

	// Получение событий для даты
	const getEventsForDate = useCallback(
		date => {
			const normalizedDate = normalizeDate(date)
			if (!normalizedDate) return []

			return events.filter(event => {
				const eventDate = normalizeDate(
					event.start_datetime || event.event_date
				)
				return (
					eventDate &&
					eventDate.getFullYear() === normalizedDate.getFullYear() &&
					eventDate.getMonth() === normalizedDate.getMonth() &&
					eventDate.getDate() === normalizedDate.getDate()
				)
			})
		},
		[events, normalizeDate]
	)

	// Обработчики событий
	const handleDateClick = date => {
		setSelectedDate(date)
	}

	const handleEventClick = event => {
		setSelectedEvent(event)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedEvent(null)
	}

	const handleMonthChange = direction => {
		setCurrentDate(prev => {
			const newDate = new Date(prev)
			newDate.setMonth(
				direction === 'prev' ? prev.getMonth() - 1 : prev.getMonth() + 1
			)
			return newDate
		})
	}

	const formatTime = dateString => {
		if (!dateString) return ''
		const date = new Date(dateString)
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	}

	// Генерация дней календаря
	const calendarDays = useMemo(() => {
		const daysInMonth = getDaysInMonth(
			currentDate.getFullYear(),
			currentDate.getMonth()
		)
		const firstDayOfMonth = getFirstDayOfMonth(
			currentDate.getFullYear(),
			currentDate.getMonth()
		)
		const days = []

		// Пустые дни в начале месяца
		for (let i = 0; i < firstDayOfMonth; i++) {
			days.push(<div key={`empty-${i}`} className='calendar-day empty'></div>)
		}

		// Дни месяца
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				day
			)
			const isSelected = date.toDateString() === selectedDate.toDateString()
			const hasEvent = hasEvents(date)
			const isToday = date.toDateString() === new Date().toDateString()

			days.push(
				<div
					key={`day-${day}`}
					className={`calendar-day 
            ${isSelected ? 'selected' : ''} 
            ${hasEvent ? 'has-event' : ''}
            ${isToday ? 'today' : ''}`}
					onClick={() => handleDateClick(date)}
				>
					<span className='day-number'>{day}</span>
					{hasEvent && <div className='event-dot'></div>}
				</div>
			)
		}

		return days
	}, [currentDate, selectedDate, hasEvents])

	// Формат даты для ключа заметок (YYYY-MM-DD)
	const selectedDateKey = useMemo(() => {
		const d = selectedDate
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
			2,
			'0'
		)}-${String(d.getDate()).padStart(2, '0')}`
	}, [selectedDate])

	// Текст заметки для выбранной даты
	const currentNote = notes[selectedDateKey] || ''

	// Обработчик изменения заметки
	const handleNoteChange = e => {
		const newNotes = {
			...notes,
			[selectedDateKey]: e.target.value,
		}
		setNotes(newNotes)
		localStorage.setItem('calendarNotes', JSON.stringify(newNotes))
	}

	return (
		<div className='calendar-overlay'>
			<div className='calendar-container'>
				<div className='calendar'>
					<div className='calendar-header'>
						<button
							className='month-nav-button'
							onClick={() => handleMonthChange('prev')}
						>
							&larr;
						</button>
						<h2>
							{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
						</h2>
						<button
							className='month-nav-button'
							onClick={() => handleMonthChange('next')}
						>
							&rarr;
						</button>
					</div>

					<div className='calendar-weekdays'>
						{weekDays.map(day => (
							<div key={day} className='weekday'>
								{day}
							</div>
						))}
					</div>

					<div className='calendar-days'>{calendarDays}</div>
				</div>

				<div className='events-panel'>
					<h3 className='selected-date-title'>
						{selectedDate.toLocaleDateString('ru-RU', {
							weekday: 'long',
							day: 'numeric',
							month: 'long',
							year: 'numeric',
						})}
					</h3>

					<div className='tabs'>
						<button
							className={`tab ${activeTab === 'events' ? 'active' : ''}`}
							onClick={() => setActiveTab('events')}
						>
							Мероприятия
						</button>
						<button
							className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
							onClick={() => setActiveTab('notes')}
						>
							Заметки
						</button>
					</div>

					<div className='tab-content'>
						{activeTab === 'events' ? (
							getEventsForDate(selectedDate).length > 0 ? (
								<div className='events-list'>
									{getEventsForDate(selectedDate).map(event => (
										<div
											key={event.id_event}
											className='event-item'
											onClick={() => handleEventClick(event)}
										>
											<h4>{event.event_name}</h4>
											<p>{event.description || 'Описание отсутствует'}</p>
											<div className='event-time'>
												{formatTime(event.start_datetime)}
												{event.end_datetime &&
													` — ${formatTime(event.end_datetime)}`}
											</div>
										</div>
									))}
								</div>
							) : (
								<div className='no-events'>Нет мероприятий на эту дату</div>
							)
						) : (
							<div className='notes-content'>
								<textarea
									placeholder='Добавьте заметки для этой даты...'
									className='notes-textarea'
									value={currentNote}
									onChange={handleNoteChange}
								/>
								{/* Кнопка сохранения не нужна, т.к. сохраняем при каждом изменении */}
							</div>
						)}
					</div>
				</div>
			</div>

			<EventDetailModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				event={selectedEvent}
				className='event-detail-modal-smaller'
			/>
		</div>
	)
}

export default Calendar
