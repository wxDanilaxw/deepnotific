import React, { useState } from 'react'
import { createEvent } from '../../api/eventApi'
import './EditEventModal.css'

const EventModal = ({ categories, departments, onClose, onSuccess }) => {
	const [formData, setFormData] = useState({
		event_name: '',
		description: '',
		start_datetime: '',
		end_datetime: '',
		location: '',
		id_category: categories[0]?.id_category || '',
		id_department: departments[0]?.id_department || '',
		status: 'planned',
	})

	const [error, setError] = useState('')

	// Функция для парсинга datetime-local строки в локальную дату
	const parseLocalDateTime = dateTimeStr => {
		if (!dateTimeStr) return null
		const [datePart, timePart] = dateTimeStr.split('T')
		if (!datePart || !timePart) return null

		const [year, month, day] = datePart.split('-').map(Number)
		const [hours, minutes] = timePart.split(':').map(Number)

		return new Date(year, month - 1, day, hours, minutes)
	}

	// Обработчик изменения полей формы
	const handleChange = e => {
		const { name, value } = e.target

		// Если изменяется дата начала — проверяем, чтобы она не была раньше текущей даты
		if (name === 'start_datetime') {
			const newStartDate = parseLocalDateTime(value)
			const now = new Date()
			if (newStartDate && newStartDate < now) {
				alert('Дата начала не может быть раньше текущей даты и времени')
				// Возвращаем значение к предыдущему (не меняем state)
				return
			}
			// Если дата начала изменена, и дата окончания раньше новой даты начала — сбросим дату окончания
			const currentEndDate = parseLocalDateTime(formData.end_datetime)
			if (currentEndDate && newStartDate && currentEndDate < newStartDate) {
				setFormData(prev => ({
					...prev,
					start_datetime: value,
					end_datetime: '',
				}))
				setError('')
				return
			}
		}

		// Если изменяется дата окончания — проверяем, чтобы она не была раньше даты начала
		if (name === 'end_datetime') {
			const newEndDate = parseLocalDateTime(value)
			const startDate = parseLocalDateTime(formData.start_datetime)
			if (newEndDate && startDate && newEndDate < startDate) {
				alert('Дата окончания не может быть раньше даты начала')
				// Не меняем значение
				return
			}
		}

		setFormData(prev => ({ ...prev, [name]: value }))
		setError('') // Сброс ошибки при изменении
	}

	// Обработчик отправки формы
	const handleSubmit = async e => {
		e.preventDefault()

		// Проверка обязательных полей
		const requiredFields = [
			'event_name',
			'description',
			'start_datetime',
			'end_datetime',
			'location',
			'id_category',
			'id_department',
		]
		for (const field of requiredFields) {
			if (!formData[field] || formData[field].toString().trim() === '') {
				setError('Пожалуйста, заполните все обязательные поля')
				return
			}
		}

		// Дополнительная проверка на всякий случай
		const start = parseLocalDateTime(formData.start_datetime)
		const end = parseLocalDateTime(formData.end_datetime)
		const now = new Date()

		if (!start) {
			setError('Неверный формат даты начала')
			return
		}
		if (start < now) {
			setError('Дата начала не может быть раньше текущей даты и времени')
			return
		}
		if (!end) {
			setError('Неверный формат даты окончания')
			return
		}
		if (end < start) {
			setError('Дата окончания не может быть раньше даты начала')
			return
		}

		try {
			await createEvent(formData)
			onSuccess()
			onClose()
		} catch (error) {
			console.error('Error creating event:', error)
			setError('Ошибка при создании события')
		}
	}

	return (
		<div className='modal'>
			<div className='modal-content'>
				<h3>Создать событие</h3>
				<form onSubmit={handleSubmit}>
					<div className='form-group'>
						<label>Название:</label>
						<input
							type='text'
							name='event_name'
							value={formData.event_name}
							onChange={handleChange}
							required
						/>
					</div>

					<div className='form-group'>
						<label>Описание:</label>
						<textarea
							name='description'
							value={formData.description}
							onChange={handleChange}
							required
						/>
					</div>

					<div className='form-group'>
						<label>Дата начала:</label>
						<input
							type='datetime-local'
							name='start_datetime'
							value={formData.start_datetime}
							onChange={handleChange}
							required
						/>
					</div>

					<div className='form-group'>
						<label>Дата окончания:</label>
						<input
							type='datetime-local'
							name='end_datetime'
							value={formData.end_datetime}
							onChange={handleChange}
							required
						/>
					</div>

					<div className='form-group'>
						<label>Место:</label>
						<input
							type='text'
							name='location'
							value={formData.location}
							onChange={handleChange}
							required
						/>
					</div>

					<div className='form-group'>
						<label>Категория:</label>
						<select
							name='id_category'
							value={formData.id_category}
							onChange={handleChange}
							required
						>
							{categories.map(category => (
								<option key={category.id_category} value={category.id_category}>
									{category.category_name}
								</option>
							))}
						</select>
					</div>

					<div className='form-group'>
						<label>Отдел:</label>
						<select
							name='id_department'
							value={formData.id_department}
							onChange={handleChange}
							required
						>
							{departments.map(department => (
								<option
									key={department.id_department}
									value={department.id_department}
								>
									{department.department_name}
								</option>
							))}
						</select>
					</div>

					<div className='form-group'>
						<label>Статус:</label>
						<select
							name='status'
							value={formData.status}
							onChange={handleChange}
						>
							<option value='planned'>Запланировано</option>
						</select>
					</div>

					{error && <div className='error-message'>{error}</div>}

					<div className='modal-actions'>
						<button type='button' onClick={onClose}>
							Отмена
						</button>
						<button type='submit'>Создать</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default EventModal
