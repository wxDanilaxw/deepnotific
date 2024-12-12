import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import './AdminPage.css'
import CreateEventModal from '../components/CreateEventModal' // Импортируйте компонент модального окна

const AdminPage = () => {
	const [events, setEvents] = useState([])
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [eventDate, setEventDate] = useState('')
	const [eventType, setEventType] = useState('')
	const [eventKind, setEventKind] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [status, setStatus] = useState(true)
	const [departments, setDepartments] = useState([])
	const [notifiedUsers, setNotifiedUsers] = useState([])
	const [selectedEvent, setSelectedEvent] = useState(null)
	const [isEditing, setIsEditing] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false) // Состояние для управления модальным окном
	const navigate = useNavigate()
	const { id } = useParams()

	// Получение списка событий
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

	// Закрытие панели администратора
	const closeAdminPanel = () => {
		navigate('/#')
	}

	// Удаление события
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

	// Редактирование события
	const handleEditEvent = event => {
		setSelectedEvent(event)
		setTitle(event.title)
		setDescription(event.description)
		setEventDate(event.event_date)
		setEventType(event.event_type)
		setEventKind(event.event_kind)
		setStartDate(event.start_date)
		setEndDate(event.end_date)
		setStatus(event.status)
		setDepartments(event.departments)
		setNotifiedUsers(event.notified_users)
		setIsEditing(true)
	}

	// Очистка формы
	const clearForm = () => {
		setTitle('')
		setDescription('')
		setEventDate('')
		setEventType('')
		setEventKind('')
		setStartDate('')
		setEndDate('')
		setStatus(true)
		setDepartments([])
		setNotifiedUsers([])
	}

	// Сохранение изменений при редактировании
	const handleSaveEdit = async () => {
		try {
			const response = await axios.put(
				`http://localhost:3000/events/${selectedEvent.id}`,
				{
					title,
					description,
					event_date: eventDate,
					event_type: eventType,
					event_kind: eventKind,
					start_date: startDate,
					end_date: endDate,
					status,
					departments,
					notified_users: notifiedUsers,
					user_role: 'admin',
				}
			)
			const updatedEvents = events.map(event =>
				event.id === selectedEvent.id ? response.data.event : event
			)
			setEvents(updatedEvents)
			setIsEditing(false)
			setSelectedEvent(null)
			clearForm()
		} catch (error) {
			console.error('Error updating event:', error)
		}
	}

	// Создание нового события
	const handleCreateEvent = async () => {
		try {
			const response = await axios.post('http://localhost:3000/events', {
				title,
				description,
				event_date: eventDate,
				event_type: eventType,
				event_kind: eventKind,
				start_date: startDate,
				end_date: endDate,
				status,
				departments,
				notified_users: notifiedUsers,
				user_role: 'admin',
			})
			setEvents([...events, response.data.event])
			clearForm()
			setIsModalOpen(false) // Закрыть модальное окно после создания события
		} catch (error) {
			console.error('Error creating event:', error)
		}
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
						onClick={() => setIsModalOpen(true)} // Открыть модальное окно
					>
						Создать событие
					</button>
				</div>

				<ul className='none-ul'>
					{events.map(event => (
						<div className='all-items' key={event.id}>
							<div className='elem-description'>
								{isEditing && selectedEvent && selectedEvent.id === event.id ? (
									<>
										<h3>Редактирование события</h3>
										<div className='two-parts-events-edit'>
											<div className='one-of-part-events-edit'>
												<div className='flex-items'>
													<label className='label-title'>Заголовок:</label>
													<input
														className='input-title'
														type='text'
														value={title}
														onChange={e => setTitle(e.target.value)}
													/>
												</div>
												<div className='flex-items'>
													<label className='label-event-type'>
														Тип мероприятия:
													</label>
													<input
														className='input-event-type'
														type='text'
														value={eventType}
														onChange={e => setEventType(e.target.value)}
													/>
												</div>
												<div className='flex-items'>
													<label className='label-event-kind'>
														Вид мероприятия:
													</label>
													<input
														className='input-event-kind'
														type='text'
														value={eventKind}
														onChange={e => setEventKind(e.target.value)}
													/>
												</div>
												<div className='flex-items'>
													<label className='label-start-date'>
														Дата начала:
													</label>
													<input
														className='input-start-date'
														type='date'
														value={startDate}
														onChange={e => setStartDate(e.target.value)}
													/>
												</div>
												<div className='flex-items'>
													<label className='label-end-date'>
														Дата окончания:
													</label>
													<input
														className='input-end-date'
														type='date'
														value={endDate}
														onChange={e => setEndDate(e.target.value)}
													/>
												</div>
												<div className='flex-items'>
													<label className='label-status'>Статус: </label>
													<input
														className='input-status'
														type='checkbox'
														checked={status}
														onChange={e => setStatus(e.target.checked)}
													/>
												</div>
												<div className='flex-items'>
													<label className='label-departments'>
														Отделы (через запятую):
													</label>
													<input
														className='input-departments'
														type='text'
														value={departments}
														onChange={e =>
															setDepartments(e.target.value.split(','))
														}
													/>
												</div>
												<div className='flex-items'>
													<label className='label-notified-users'>
														Пользователи
													</label>
													<input
														className='input-notified-users'
														type='text'
														value={notifiedUsers}
														onChange={e =>
															setNotifiedUsers(e.target.value.split(','))
														}
													/>
												</div>
												<button
													className='button-event-edit'
													onClick={handleSaveEdit}
												>
													Сохранить
												</button>
											</div>
											<label className='label-description'>Описание: </label>
											<textarea
												className='input-description'
												value={description}
												onChange={e => setDescription(e.target.value)}
											/>
										</div>
									</>
								) : (
									<>
										<li>
											<strong>{event.title}</strong> <br />
											<strong>Тип:</strong> {event.event_type}
											<br />
											<strong>Вид:</strong> {event.event_kind}
											<br />
											<strong>Дата начала:</strong>{' '}
											{format(new Date(event.start_date), 'dd-MM-yyyy')}
											<br />
											<strong>Дата окончания:</strong>{' '}
											{format(new Date(event.end_date), 'dd-MM-yyyy')}
											<br />
											<strong>Статус:</strong>{' '}
											{event.status ? 'Активен' : 'Неактивен'}
											<br />
											<strong>Отделы:</strong> {event.departments.join(', ')}
											<br />
											<strong>Пользователи для уведомления:</strong>{' '}
											{event.notified_users.join(', ')}
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
									</>
								)}
							</div>
							{!isEditing && (
								<div className='description-event'>
									<strong>Описание:</strong> {event.description}
								</div>
							)}
						</div>
					))}
				</ul>
			</div>

			{/* Модальное окно для создания события */}
			<CreateEventModal
				isOpen={isModalOpen}
				onRequestClose={() => setIsModalOpen(false)}
				onSubmit={handleCreateEvent}
				title={title}
				setTitle={setTitle}
				description={description}
				setDescription={setDescription}
				eventDate={eventDate}
				setEventDate={setEventDate}
				eventType={eventType}
				setEventType={setEventType}
				eventKind={eventKind}
				setEventKind={setEventKind}
				startDate={startDate}
				setStartDate={setStartDate}
				endDate={endDate}
				setEndDate={setEndDate}
				status={status}
				setStatus={setStatus}
				departments={departments}
				setDepartments={setDepartments}
				notifiedUsers={notifiedUsers}
				setNotifiedUsers={setNotifiedUsers}
			>
				<h3>Создание нового события</h3>
				<div className='two-parts-events-edit'>
					<div className='one-of-part-events-edit'>
						<div className='flex-items'>
							<label className='label-title'>Заголовок:</label>
							<input
								className='input-title'
								type='text'
								value={title}
								onChange={e => setTitle(e.target.value)}
							/>
						</div>
						<div className='flex-items'>
							<label className='label-event-type'>Тип мероприятия: </label>
							<input
								className='input-event-type'
								type='text'
								value={eventType}
								onChange={e => setEventType(e.target.value)}
							/>
						</div>
						<div className='flex-items'>
							<label className='label-event-kind'>Вид мероприятия: </label>
							<input
								className='input-event-kind'
								type='text'
								value={eventKind}
								onChange={e => setEventKind(e.target.value)}
							/>
						</div>
						<div className='flex-items'>
							<label className='label-start-date'>Дата начала: </label>
							<input
								className='input-start-date'
								type='date'
								value={startDate}
								onChange={e => setStartDate(e.target.value)}
							/>
						</div>
						<div className='flex-items'>
							<label className='label-end-date'>Дата окончания: </label>
							<input
								className='input-end-date'
								type='date'
								value={endDate}
								onChange={e => setEndDate(e.target.value)}
							/>
						</div>
						<div className='flex-items'>
							<label className='label-status'>Статус: </label>
							<input
								className='input-status'
								type='checkbox'
								checked={status}
								onChange={e => setStatus(e.target.checked)}
							/>
						</div>
						<div className='flex-items'>
							<label className='label-departments'>
								Отделы (через запятую):
							</label>
							<input
								className='input-departments'
								type='text'
								value={departments}
								onChange={e => setDepartments(e.target.value.split(','))}
							/>
						</div>
						<div className='flex-items'>
							<label className='label-notified-users'>
								Пользователи для уведомления (через запятую):
							</label>
							<input
								className='input-notified-users'
								type='text'
								value={notifiedUsers}
								onChange={e => setNotifiedUsers(e.target.value.split(','))}
							/>
						</div>
						<button className='button-event-edit' onClick={handleCreateEvent}>
							Создать
						</button>
					</div>
					<label className='label-description'>Описание: </label>
					<textarea
						className='input-description'
						value={description}
						onChange={e => setDescription(e.target.value)}
					/>
				</div>
			</CreateEventModal>
		</div>
	)
}

export default AdminPage
