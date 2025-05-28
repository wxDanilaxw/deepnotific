import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from './Calendar'
import WorkList from '../components/work_list'
import './main.css'
import LoginModal from '../components/LoginModal'
import EventDetailModal from '../components/EventDetailModal'
import CreateEventModal from '../components/CreateEventModal'
import axios from 'axios'

const Main = () => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [username, setUsername] = useState('')
	const [userRole, setUserRole] = useState('')
	const [events, setEvents] = useState([])
	const [selectedEvent, setSelectedEvent] = useState(null)
	const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false)
	const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false)
	const [isCalendarOpen, setIsCalendarOpen] = useState(false)
	const [currentDate] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const dropdownRef = useRef(null)

	const navigate = useNavigate()

	// Функция форматирования имени пользователя: "Фамилия И"
	const formatUserName = user => {
		if (!user) return ''
		const lastName = user.last_name || user.lastname || ''
		const firstName = user.first_name || user.firstname || ''
		const firstInitial = firstName ? firstName[0].toUpperCase() : ''
		return lastName && firstInitial
			? `${lastName} ${firstInitial}`
			: user.login || ''
	}

	// Инициализация авторизации из localStorage при загрузке
	useEffect(() => {
		const token = localStorage.getItem('token')
		const userStr = localStorage.getItem('user')

		if (token && userStr) {
			try {
				const user = JSON.parse(userStr)
				setIsAuthenticated(true)
				setUsername(formatUserName(user))
				setUserRole(user.role || user.user_role || '')
				fetchAllEvents(token)
			} catch {
				// Если парсинг не удался, очистить данные
				handleLogout()
			}
		}
	}, [])

	// Перехватчик ошибок 401 — автоматически логаутит
	useEffect(() => {
		const requestInterceptor = axios.interceptors.response.use(
			response => response,
			error => {
				if (error.response?.status === 401 && isAuthenticated) {
					handleLogout()
				}
				return Promise.reject(error)
			}
		)

		return () => {
			axios.interceptors.response.eject(requestInterceptor)
		}
	}, [isAuthenticated])

	// Закрытие выпадающего меню при клике вне его
	useEffect(() => {
		const handleClickOutside = event => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsDropdownOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const openModal = () => setIsModalOpen(true)
	const closeModal = () => setIsModalOpen(false)

	const openEventDetailModal = event => {
		setSelectedEvent(event)
		setIsEventDetailModalOpen(true)
	}
	const closeEventDetailModal = () => setIsEventDetailModalOpen(false)

	const openCreateEventModal = () => setIsCreateEventModalOpen(true)
	const closeCreateEventModal = () => setIsCreateEventModalOpen(false)

	// Обновлённая функция успешного логина
	const handleLoginSuccess = data => {
		const token = data.token || data.accessToken || '' // подставьте свой ключ токена
		const userData = {
			id: data.user.id_user,
			login: data.user.login_users || data.user.login,
			role: data.user.user_role || data.user.role,
			departmentId: data.user.id_department,
			departmentName: data.user.department_name,
			last_name: data.user.last_name || data.user.lastname,
			first_name: data.user.first_name || data.user.firstname,
		}

		localStorage.setItem('token', token)
		localStorage.setItem('user', JSON.stringify(userData))

		setIsAuthenticated(true)
		setUsername(formatUserName(userData))
		setUserRole(userData.role)
		closeModal()
		fetchAllEvents(token)
	}

	// Логаут — очистка localStorage и состояния
	const handleLogout = () => {
		setIsAuthenticated(false)
		setUsername('')
		setUserRole('')
		setEvents([])
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		navigate('/') // Перенаправление на главную страницу
	}

	// Загрузка событий с передачей токена
	const fetchAllEvents = async token => {
		try {
			const response = await axios.get('http://localhost:3000/api/events', {
				headers: {
					Authorization: `Bearer ${token || localStorage.getItem('token')}`,
				},
			})
			setEvents(Array.isArray(response.data) ? response.data : [])
		} catch (error) {
			console.error('Error fetching events:', error)
			setEvents([])
		}
	}

	const handleEventCreated = () => {
		fetchAllEvents(localStorage.getItem('token'))
		closeCreateEventModal()
	}

	const handleDateSelect = date => {
		setSelectedDate(date)
		setIsCalendarOpen(false)
	}

	const getEventsForSelectedDate = () => {
		if (!selectedDate || !Array.isArray(events)) return []

		const dateStr = selectedDate.toISOString().split('T')[0]
		return events.filter(event => {
			const eventDate = event.start_datetime || event.event_date
			return eventDate && eventDate.split('T')[0] === dateStr
		})
	}

	const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen)

	return (
		<main>
			<div className='main-content'>
				{!isAuthenticated ? (
					<button className='join-button' onClick={openModal}>
						Вход
					</button>
				) : (
					<div className='user-controls'>
						<div className='dropdown' ref={dropdownRef}>
							<button
								className='dropbtn'
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							>
								{username}
							</button>
							{isDropdownOpen && (
								<div className='dropdown-content'>
									<button onClick={handleLogout}>Выйти</button>
								</div>
							)}
						</div>

						{userRole === 'admin' && (
							<button className='admin-panel-button'>Админ-панель</button>
						)}
					</div>
				)}

				<LoginModal
					isOpen={isModalOpen}
					onClose={closeModal}
					onLoginSuccess={handleLoginSuccess}
				/>

				{isAuthenticated && (
					<div className='content-area'>
						<button className='calendar-button' onClick={toggleCalendar}>
							Календарь событий
						</button>

						<div className='margin-Worklist'>
							<WorkList
								onEventClick={openEventDetailModal}
								currentDate={selectedDate}
								onDateSelect={handleDateSelect}
								isCalendarOpen={isCalendarOpen}
								toggleCalendar={toggleCalendar}
								events={getEventsForSelectedDate()}
								userRole={userRole}
							/>
						</div>

						{isCalendarOpen && (
							<div className='calendar-overlay'>
								<div className='overlay' onClick={toggleCalendar}></div>
								<div className='calendar-container'>
									<button
										className='close-calendar-btn'
										onClick={toggleCalendar}
										style={{
											position: 'absolute',
											top: '10px',
											right: '10px',
											background: 'transparent',
											border: 'none',
											fontSize: '20px',
											cursor: 'pointer',
											zIndex: 1002,
										}}
									>
										×
									</button>
									<Calendar
										currentDate={currentDate}
										selectedDate={selectedDate}
										onDateSelect={handleDateSelect}
										events={events}
										onClose={toggleCalendar}
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
					userRole={userRole}
					onEventUpdated={() => fetchAllEvents(localStorage.getItem('token'))}
				/>

				<CreateEventModal
					isOpen={isCreateEventModalOpen}
					onRequestClose={closeCreateEventModal}
					onEventCreated={handleEventCreated}
					userRole={userRole}
				/>
			</div>
		</main>
	)
}

export default Main
