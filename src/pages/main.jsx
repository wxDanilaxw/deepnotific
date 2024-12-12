import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from './Calendar'
import WorkList from '../components/work_list'
import './main.css'
import LoginModal from '../components/LoginModal'
import EventDetailModal from '../components/EventDetailModal'
import CreateEventModal from '../components/CreateEventModal'

const Main = () => {
	// Модальное окно
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [fullName, setFullName] = useState('')
	const [userRole, setUserRole] = useState('')
	const [userDepartment, setUserDepartment] = useState('')
	const [events, setEvents] = useState([])
	const [selectedEvent, setSelectedEvent] = useState(null)
	const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false)
	const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false)
	const navigate = useNavigate()

	// Состояние для управления видимостью выпадающего меню
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)

	// Ссылка на выпадающее меню для обработки клика вне его области
	const dropdownRef = useRef(null)

	const openModal = () => setIsModalOpen(true)
	const closeModal = () => setIsModalOpen(false)

	const handleLoginSuccess = user => {
		setIsAuthenticated(true)
		const { last_name, first_name, middle_name, role, department } = user
		setFullName(`${last_name} ${first_name[0]}.${middle_name[0]}.`)
		setUserRole(role)
		setUserDepartment(department)
		closeModal()

		// Сохраняем данные аутентификации в localStorage
		localStorage.setItem('isAuthenticated', true)
		localStorage.setItem(
			'fullName',
			`${last_name} ${first_name[0]}.${middle_name[0]}.`
		)
		localStorage.setItem('userRole', role)
		localStorage.setItem('userDepartment', department)
	}

	const handleLogout = () => {
		setIsAuthenticated(false)
		setFullName('')
		setUserRole('')
		setUserDepartment('')

		// Удаляем данные аутентификации из localStorage
		localStorage.removeItem('isAuthenticated')
		localStorage.removeItem('fullName')
		localStorage.removeItem('userRole')
		localStorage.removeItem('userDepartment')
	}

	const [isCalendarOpen, setIsCalendarOpen] = useState(false)
	const [currentDate, setCurrentDate] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState(new Date())

	const toggleCalendar = () => {
		setIsCalendarOpen(!isCalendarOpen)
	}

	const getFormattedDate = date => {
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0') // Месяцы начинаются с 0
		const year = date.getFullYear()
		return `${day}/${month}/${year}`
	}

	const goToPreviousDay = () => {
		const previousDay = new Date(currentDate)
		previousDay.setDate(previousDay.getDate() - 1)
		setCurrentDate(previousDay)
		setSelectedDate(previousDay)
	}

	const goToNextDay = () => {
		const nextDay = new Date(currentDate)
		nextDay.setDate(nextDay.getDate() + 1)
		setCurrentDate(nextDay)
		setSelectedDate(nextDay)
	}

	const handleDateSelect = date => {
		setCurrentDate(date)
		setSelectedDate(date)
	}

	const fetchEvents = async () => {
		try {
			const response = await fetch(
				`http://localhost:3000/events?event_date=${getFormattedDate(
					selectedDate
				)}`
			)
			const data = await response.json()
			setEvents(data)
		} catch (error) {
			console.error('Error fetching events:', error)
		}
	}

	useEffect(() => {
		if (isAuthenticated) {
			fetchEvents()
		}
	}, [isAuthenticated, selectedDate])

	const openEventDetailModal = event => {
		setSelectedEvent(event)
		setIsEventDetailModalOpen(true)
	}

	const closeEventDetailModal = () => {
		setSelectedEvent(null)
		setIsEventDetailModalOpen(false)
	}

	const openCreateEventModal = () => {
		setIsCreateEventModalOpen(true)
	}

	const closeCreateEventModal = () => {
		setIsCreateEventModalOpen(false)
	}

	const handleEventCreated = () => {
		fetchEvents()
	}

	const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false)

	const goToAdminPanel = () => {
		setIsAdminPanelOpen(true)
		navigate('/adminpanel')
	}

	const closeAdminPanel = () => {
		setIsAdminPanelOpen(false)
		navigate('/')
	}

	// Обработчик клика для переключения состояния выпадающего меню
	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen)
	}

	// Обработчик клика вне выпадающего меню
	const handleClickOutside = event => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsDropdownOpen(false)
		}
	}

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	// Восстановление данных аутентификации при загрузке страницы
	useEffect(() => {
		const isAuthenticated = localStorage.getItem('isAuthenticated')
		const fullName = localStorage.getItem('fullName')
		const userRole = localStorage.getItem('userRole')
		const userDepartment = localStorage.getItem('userDepartment')

		if (isAuthenticated) {
			setIsAuthenticated(true)
			setFullName(fullName)
			setUserRole(userRole)
			setUserDepartment(userDepartment)
		}
	}, [])

	return (
		<main>
			<body>
				{!isAuthenticated ? (
					<button className='join-button' onClick={openModal}>
						Вход
					</button>
				) : (
					<div>
						<div
							className='dropdown'
							ref={dropdownRef}
							onClick={toggleDropdown}
						>
							<button className='dropbtn'> {fullName}</button>
							<div className='dropdown-content'>
								<a href='#'>Старый сайт</a>
								<a href='#'>Облако</a>
								<a href='#'>Карточка</a>
								<a href='#'>Портфолио</a>
								<a href='#'>Журнал</a>
								<a href='#'>Настройки</a>
								<a onClick={handleLogout} href='#'>
									Выйти
								</a>
							</div>
						</div>

						{userRole === 'admin' && (
							<button className='admin-panel-button' onClick={goToAdminPanel}>
								Админ-панель
							</button>
						)}
					</div>
				)}
				<LoginModal
					isOpen={isModalOpen}
					onClose={closeModal}
					onLoginSuccess={handleLoginSuccess}
				/>
				{isAuthenticated && (
					<div className='list-banner'>
						<button className='calendar-button' onClick={toggleCalendar}>
							Календарь событий
						</button>
						<WorkList
							className='work-list'
							events={events}
							onEventClick={openEventDetailModal}
							currentDate={selectedDate}
							onDateSelect={handleDateSelect}
							isCalendarOpen={isCalendarOpen}
							toggleCalendar={toggleCalendar}
						/>
						{isCalendarOpen && (
							<Calendar
								currentDate={currentDate}
								selectedDate={selectedDate}
								onDateSelect={handleDateSelect}
							/>
						)}
					</div>
				)}
				<EventDetailModal
					isOpen={isEventDetailModalOpen}
					onClose={closeEventDetailModal}
					event={selectedEvent}
				/>
				<CreateEventModal
					isOpen={isCreateEventModalOpen}
					onClose={closeCreateEventModal}
					onEventCreated={handleEventCreated}
				/>
				{isAdminPanelOpen && (
					<div className='admin-panel'>
						<button
							className='close-admin-panel-button'
							onClick={closeAdminPanel}
						>
							Закрыть
						</button>
						{/* Здесь будет содержимое админ-панели */}
					</div>
				)}
			</body>
		</main>
	)
}

export default Main
