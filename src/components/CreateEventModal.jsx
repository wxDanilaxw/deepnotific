import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import axios from 'axios'
import Select from 'react-select'

Modal.setAppElement('#root')

const CreateEventModal = ({ isOpen, onRequestClose, onEventCreated }) => {
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

	// Состояние для управления текущим шагом
	const [currentStep, setCurrentStep] = useState(1)

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

	// Обработчик нажатия Enter
	const handleKeyPress = e => {
		if (e.key === 'Enter') {
			handleNext()
		}
	}

	// Переход к следующему шагу
	const handleNext = () => {
		if (validateStep(currentStep)) {
			setCurrentStep(currentStep + 1)
		}
	}

	// Переход к предыдущему шагу
	const handleBack = () => {
		setCurrentStep(currentStep - 1)
	}

	// Валидация текущего шага
	const validateStep = step => {
		switch (step) {
			case 1:
				if (!title) {
					setError('Заполните поле "Заголовок"')
					return false
				}
				break
			case 2:
				if (!eventType) {
					setError('Выберите "Тип мероприятия"')
					return false
				}
				break
			case 3:
				if (!eventKind) {
					setError('Выберите "Вид мероприятия"')
					return false
				}
				break
			case 4:
				if (!startDate) {
					setError('Укажите "Дату начала"')
					return false
				}
				break
			case 5:
				if (!endDate) {
					setError('Укажите "Дату окончания"')
					return false
				}
				if (new Date(startDate) > new Date(endDate)) {
					setError('Дата начала не может быть позже даты окончания')
					return false
				}
				break
			case 6:
				if (selectedDepartments.length === 0) {
					setError('Выберите хотя бы один отдел')
					return false
				}
				break
			default:
				break
		}
		setError(null)
		return true
	}

	const handleSubmit = () => {
		const eventData = {
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
			.post('http://localhost:3000/events', eventData)
			.then(response => {
				console.log('Event created successfully:', response.data)
				onEventCreated()
				onRequestClose()
			})
			.catch(error => {
				console.error('Error creating event:', error)
				if (error.response) {
					setError(
						'Ошибка при создании события: ' +
							(error.response.data.error || 'Неизвестная ошибка')
					)
				} else {
					setError('Ошибка при создании события')
				}
			})
	}

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onRequestClose}
			contentLabel='Создать событие'
			className='modal'
			overlayClassName='overlay'
		>
			<button className='close-button' onClick={onRequestClose}>
				×
			</button>
			<h3>Создание нового события</h3>
			{error && <div className='error-message'>{error}</div>}

			{currentStep === 1 && (
				<div className='step'>
					<label className='label-title'>Заголовок:</label>
					<input
						className='input-title'
						type='text'
						value={title}
						onChange={e => setTitle(e.target.value)}
						onKeyPress={handleKeyPress}
						required
					/>
				</div>
			)}

			{currentStep === 2 && (
				<div className='step'>
					<label className='label-event-type'>Тип мероприятия:</label>
					<select
						className='input-event-type'
						value={eventType}
						onChange={e => setEventType(e.target.value)}
						onKeyPress={handleKeyPress}
						required
					>
						<option value=''>Выберите тип</option>
						<option value='online'>Онлайн</option>
						<option value='offline'>Офлайн</option>
						<option value='offline'>Заочное</option>
					</select>
				</div>
			)}

			{currentStep === 3 && (
				<div className='step'>
					<label className='label-event-kind'>Вид мероприятия:</label>
					<select
						className='input-event-kind'
						value={eventKind}
						onChange={e => setEventKind(e.target.value)}
						onKeyPress={handleKeyPress}
						required
					>
						<option value=''>Выберите вид</option>
						<option value='conference'>Конференция</option>
						<option value='call'>Созвон</option>
						<option value='meeting'>Сбор</option>
						<option value='hall_event'>Мероприятие в актовом зале</option>
					</select>
				</div>
			)}

			{currentStep === 4 && (
				<div className='step'>
					<label className='label-start-date'>Дата начала:</label>
					<input
						className='input-start-date'
						type='date'
						value={startDate}
						onChange={e => setStartDate(e.target.value)}
						onKeyPress={handleKeyPress}
						required
					/>
				</div>
			)}

			{currentStep === 5 && (
				<div className='step'>
					<label className='label-end-date'>Дата окончания:</label>
					<input
						className='input-end-date'
						type='date'
						value={endDate}
						onChange={e => setEndDate(e.target.value)}
						onKeyPress={handleKeyPress}
						required
					/>
				</div>
			)}

			{currentStep === 6 && (
				<div className='step'>
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
			)}

			{currentStep === 7 && (
				<div className='step'>
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
			)}

			{currentStep === 8 && (
				<div className='step'>
					<label className='label-description'>Описание мероприятия:</label>
					<textarea
						placeholder='Описание мероприятия'
						className='input-description-create'
						value={description}
						onChange={e => setDescription(e.target.value)}
						onKeyPress={handleKeyPress}
					/>
				</div>
			)}

			<div className='navigation-buttons'>
				{currentStep > 1 && (
					<button className='button-back' onClick={handleBack}>
						Назад
					</button>
				)}
				{currentStep < 8 && (
					<button className='button-next' onClick={handleNext}>
						Далее
					</button>
				)}
				{currentStep === 8 && (
					<button className='button-submit' onClick={handleSubmit}>
						Создать
					</button>
				)}
			</div>
		</Modal>
	)
}

export default CreateEventModal
