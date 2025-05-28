import React, { useState, useEffect } from 'react'
import { updateEvent } from '../../api/eventApi'

const EditEventModal = ({
	event,
	categories,
	departments,
	onClose,
	onSuccess,
}) => {
	// Функция форматирования даты для input[type=datetime-local]
	function formatForInput(datetime) {
		if (!datetime) return ''
		const date = new Date(datetime)
		return date.toISOString().slice(0, 16)
	}

	// Определяем, можно ли редактировать дату начала
	const now = new Date()
	const eventStart = new Date(event.start_datetime)
	const eventEnd = new Date(event.end_datetime || event.start_datetime)
	// Если событие началось, но не закончилось — запретить редактировать дату начала
	const isStartDateEditable = !(eventStart <= now && now <= eventEnd)

	const [formData, setFormData] = useState({
		event_name: event.event_name,
		description: event.description,
		start_datetime: formatForInput(event.start_datetime),
		end_datetime: formatForInput(event.end_datetime),
		location: event.location,
		id_category: event.id_category,
		id_department: event.id_department,
		status: event.status,
	})

	const [error, setError] = useState('')

	const handleChange = e => {
		const { name, value } = e.target

		// Если пытаются изменить дату начала, но она заблокирована — игнорируем
		if (name === 'start_datetime' && !isStartDateEditable) {
			return
		}

		setFormData(prev => ({ ...prev, [name]: value }))
		setError('')
	}

	const handleSubmit = async e => {
		e.preventDefault()

		// Проверка даты окончания не раньше даты начала
		if (formData.end_datetime && formData.start_datetime) {
			const start = new Date(formData.start_datetime)
			const end = new Date(formData.end_datetime)
			if (end < start) {
				setError('Дата окончания не может быть раньше даты начала')
				return
			}
		}

		try {
			await updateEvent(event.id_event, formData)
			onSuccess()
			onClose()
		} catch (error) {
			console.error('Error updating event:', error)
			setError('Ошибка при сохранении события')
		}
	}

	return (
		<div className='modal'>
			<div className='modal-content'>
				<h3>Редактировать событие</h3>
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
							disabled={!isStartDateEditable}
							title={
								!isStartDateEditable
									? 'Дата начала редактируется только до начала события'
									: ''
							}
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
						<button type='submit'>Сохранить</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default EditEventModal
