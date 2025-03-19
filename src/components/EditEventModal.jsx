import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import axios from 'axios'
import Select from 'react-select'

Modal.setAppElement('#root')

const EditEventModal = ({ isOpen, onRequestClose, event, onEventUpdated }) => {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [eventType, setEventType] = useState('')
	const [eventKind, setEventKind] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [status, setStatus] = useState(true)
	const [allDepartments, setAllDepartments] = useState([])
	const [selectedDepartments, setSelectedDepartments] = useState([])
	const [usersInSelectedDepartments, setUsersInSelectedDepartments] = useState(
		[]
	)
	const [notifiedUsers, setNotifiedUsers] = useState([])
	const [loadingDepartments, setLoadingDepartments] = useState(false)
	const [loadingUsers, setLoadingUsers] = useState(false)
	const [error, setError] = useState(null)

	// Инициализация состояний при изменении event
	useEffect(() => {
		if (event) {
			setTitle(event.title || '')
			setDescription(event.description || '')
			setEventType(event.event_type || '')
			setEventKind(event.event_kind || '')
			setStartDate(event.start_date || '')
			setEndDate(event.end_date || '')
			setStatus(event.status || true)

			// Преобразуем departments в массив чисел (ID отделов)
			const departmentsArray = event.departments
				? event.departments
						.map(dept => {
							const department = allDepartments.find(
								d => d.department_name === dept
							)
							return department ? department.id_department : null
						})
						.filter(id => id !== null)
				: []
			setSelectedDepartments(departmentsArray)

			// Убедимся, что notified_users является массивом чисел
			const notifiedUsersArray = event.notified_users || []
			setNotifiedUsers(notifiedUsersArray)
		}
	}, [event, allDepartments])

	// Загрузка отделов
	useEffect(() => {
		if (isOpen) {
			setLoadingDepartments(true)
			axios
				.get('http://localhost:3000/departments')
				.then(response => {
					setAllDepartments(response.data)
					setError(null)
				})
				.catch(error => {
					console.error('Error fetching departments:', error)
					setError('Ошибка при загрузке отделов')
				})
				.finally(() => {
					setLoadingDepartments(false)
				})
		}
	}, [isOpen])

	// Загрузка пользователей
	useEffect(() => {
		if (selectedDepartments.length > 0) {
			setLoadingUsers(true)
			axios
				.get(
					`http://localhost:3000/users?department_id=${selectedDepartments.join(
						','
					)}`
				)
				.then(response => {
					setUsersInSelectedDepartments(response.data)
					setError(null)
				})
				.catch(error => {
					console.error('Error fetching users:', error)
					setError('Ошибка при загрузке пользователей')
				})
				.finally(() => {
					setLoadingUsers(false)
				})
		} else {
			setUsersInSelectedDepartments([])
		}
	}, [selectedDepartments])

	// Обработка отправки формы
	const handleSubmit = () => {
		if (!title) {
			setError('Заполните поле "Заголовок"')
			return
		}
		if (!eventType) {
			setError('Выберите "Тип мероприятия"')
			return
		}
		if (!eventKind) {
			setError('Выберите "Вид мероприятия"')
			return
		}
		if (!startDate) {
			setError('Укажите "Дату начала"')
			return
		}
		if (!endDate) {
			setError('Укажите "Дату окончания"')
			return
		}
		if (new Date(startDate) > new Date(endDate)) {
			setError('Дата начала не может быть позже даты окончания')
			return
		}
		if (selectedDepartments.length === 0) {
			setError('Выберите хотя бы один отдел')
			return
		}

		const updatedEventData = {
			title,
			description,
			event_type: eventType,
			event_kind: eventKind,
			start_date: startDate,
			end_date: endDate,
			status,
			departments: selectedDepartments,
			notified_users: notifiedUsers,
			user_role: 'admin',
		}

		axios
			.put(`http://localhost:3000/events/${event.id}`, updatedEventData)
			.then(response => {
				console.log('Event updated successfully:', response.data)
				onEventUpdated() // Обновляем список событий в AdminPage
				onRequestClose() // Закрываем модальное окно
			})
			.catch(error => {
				console.error('Error updating event:', error)
				if (error.response) {
					console.error('Server responded with:', error.response.data)
				}
			})
	}

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onRequestClose}
			contentLabel='Редактировать событие'
			className='modal'
			overlayClassName='overlay'
		>
			<button className='close-button' onClick={onRequestClose}>
				×
			</button>
			<h3>Редактирование события</h3>
			{error && <div className='error-message'>{error}</div>}
			<div className='two-parts-events-edit'>
				<div className='one-of-part-events-edit'>
					<div className='flex-items'>
						<label className='label-title'>Заголовок:</label>
						<input
							className='input-title'
							type='text'
							value={title}
							onChange={e => setTitle(e.target.value)}
							required
						/>
					</div>

					<div className='flex-items'>
						<label className='label-event-type'>Тип мероприятия:</label>
						<select
							className='input-event-type'
							value={eventType}
							onChange={e => setEventType(e.target.value)}
							required
						>
							<option value='online'>Онлайн</option>
							<option value='offline'>Офлайн</option>
						</select>
					</div>

					<div className='flex-items'>
						<label className='label-event-kind'>Вид мероприятия:</label>
						<select
							className='input-event-kind'
							value={eventKind}
							onChange={e => setEventKind(e.target.value)}
							required
						>
							<option value='conference'>Конференция</option>
							<option value='call'>Созвон</option>
							<option value='meeting'>Сбор</option>
							<option value='hall_event'>Мероприятие в актовом зале</option>
						</select>
					</div>

					<div className='flex-items'>
						<label className='label-start-date'>Дата начала:</label>
						<input
							className='input-start-date'
							type='date'
							value={startDate}
							onChange={e => setStartDate(e.target.value)}
							required
						/>
					</div>

					<div className='flex-items'>
						<label className='label-end-date'>Дата окончания:</label>
						<input
							className='input-end-date'
							type='date'
							value={endDate}
							onChange={e => setEndDate(e.target.value)}
							required
						/>
					</div>

					<div className='flex-items'>
						<label className='label-status'>Статус:</label>
						<input
							className='input-status'
							type='checkbox'
							checked={status}
							onChange={e => setStatus(e.target.checked)}
						/>
					</div>

					<div className='flex-items'>
						<label className='label-departments'>Отделы:</label>
						{loadingDepartments ? (
							<p>Загрузка отделов...</p>
						) : allDepartments.length > 0 ? (
							<Select
								isMulti
								options={allDepartments.map(department => ({
									value: department.id_department,
									label: department.department_name,
								}))}
								value={selectedDepartments.map(id => ({
									value: id,
									label: allDepartments.find(dep => dep.id_department === id)
										.department_name,
								}))}
								onChange={selectedOptions => {
									setSelectedDepartments(
										selectedOptions.map(option => option.value)
									)
								}}
								placeholder='Выберите отделы'
							/>
						) : (
							<p>Отделы не загружены</p>
						)}
					</div>

					<div className='flex-items'>
						<label className='label-notified-users'>Пользователи:</label>
						{loadingUsers ? (
							<p>Загрузка пользователей...</p>
						) : usersInSelectedDepartments.length > 0 ? (
							usersInSelectedDepartments.map(user => (
								<div key={user.id_user}>
									<input
										type='checkbox'
										id={`user-${user.id_user}`}
										checked={notifiedUsers.includes(user.id_user)}
										onChange={() => {
											setNotifiedUsers(prev =>
												prev.includes(user.id_user)
													? prev.filter(id => id !== user.id_user)
													: [...prev, user.id_user]
											)
										}}
									/>
									<label htmlFor={`user-${user.id_user}`}>
										{user.login_users} ({user.last_name} {user.first_name})
									</label>
								</div>
							))
						) : (
							<p>Пользователи не загружены</p>
						)}
					</div>

					<button className='button-event-edit' onClick={handleSubmit}>
						Сохранить изменения
					</button>
				</div>

				<textarea
					placeholder='Описание мероприятия'
					className='input-description-create'
					value={description}
					onChange={e => setDescription(e.target.value)}
				/>
			</div>
		</Modal>
	)
}

export default EditEventModal
