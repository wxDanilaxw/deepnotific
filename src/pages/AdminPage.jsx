import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import './AdminPage.css'
import CreateEventModal from '../components/CreateEventModal'
import EditEventModal from '../components/EditEventModal' // Импортируем компонент редактирования

const AdminPage = () => {
	const [events, setEvents] = useState([])
	const [selectedEvent, setSelectedEvent] = useState(null)
	const [isEditing, setIsEditing] = useState(false)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const navigate = useNavigate()

	const fetchEvents = async () => {
		try {
			const response = await axios.get('http://localhost:3000/events')
			setEvents(response.data)
		} catch (error) {
			console.error('Error fetching events:', error)
		}
	}

	useEffect(() => {
		fetchEvents()
	}, [])

	const closeAdminPanel = () => {
		navigate('/#')
	}

	const handleDeleteEvent = async id => {
		const confirmDelete = window.confirm(
			'Вы уверены, что хотите удалить это событие?'
		)
		if (!confirmDelete) return

		try {
			await axios.delete(`http://localhost:3000/events/${id}`, {
				data: { user_role: 'admin' },
			})
			const updatedEvents = events.filter(event => event.id !== id)
			setEvents(updatedEvents)
		} catch (error) {
			console.error('Error deleting event:', error)
		}
	}

	const handleEditEvent = event => {
		setSelectedEvent(event)
		setIsEditModalOpen(true) // Открываем модальное окно редактирования
	}

	return (
		<div className='admin-page'>
			<div className='margin-top'></div>
			<button onClick={closeAdminPanel} className='close-panel-button'>
				Закрыть
			</button>
			<div className='event-list'>
				<div className='div-group-title'>
					<h2 className='event-title'>Список событий</h2>
					<button
						className='create-event-button'
						onClick={() => setIsCreateModalOpen(true)}
					>
						Создать событие
					</button>
				</div>

				<ul className='none-ul'>
					{events.map(event => (
						<div className='all-items' key={event.id}>
							<div className='elem-description'>
								<li>
									<strong>{event.title}</strong> <br />
									<strong>Тип:</strong> {event.event_type} <br />
									<strong>Вид:</strong> {event.event_kind} <br />
									<strong>Дата начала:</strong>{' '}
									{format(new Date(event.start_date), 'dd-MM-yyyy')} <br />
									<strong>Дата окончания:</strong>{' '}
									{format(new Date(event.end_date), 'dd-MM-yyyy')} <br />
									<strong>Статус:</strong>{' '}
									{event.status ? 'Активен' : 'Неактивен'} <br />
									<strong>Отделы:</strong>{' '}
									{event.departments && event.departments.length > 0
										? event.departments.join(', ')
										: 'Нет данных'}{' '}
									<br />
									<strong>Пользователи для уведомления:</strong>{' '}
									{event.notified_users && event.notified_users.length > 0
										? event.notified_users.join(', ')
										: 'Нет данных'}{' '}
									<br />
									<div className='button-group'>
										<button
											className='button-event-edit'
											onClick={() => handleEditEvent(event)}
										>
											Редактировать
										</button>
										<button
											className='button-event-edit'
											onClick={() => handleDeleteEvent(event.id)}
										>
											Удалить
										</button>
									</div>
								</li>
							</div>
							<div className='description-event'>
								<strong>Описание:</strong> {event.description}
							</div>
						</div>
					))}
				</ul>
			</div>

			<CreateEventModal
				isOpen={isCreateModalOpen}
				onRequestClose={() => setIsCreateModalOpen(false)}
				onEventCreated={fetchEvents}
			/>

			<EditEventModal
				isOpen={isEditModalOpen}
				onRequestClose={() => setIsEditModalOpen(false)}
				event={selectedEvent}
				onEventUpdated={fetchEvents}
			/>
		</div>
	)
}

export default AdminPage
