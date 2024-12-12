import React from 'react'
import Modal from './DetailModal'
import './EventDetail.css'

const EventDetailModal = ({ isOpen, onClose, event }) => {
	if (!event) return null

	// Функция для форматирования даты
	const formatDate = dateString => {
		const date = new Date(dateString)
		return date.toLocaleDateString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		})
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<h2>{event.title}</h2>
			<div className='event-detail-modal-details'>
				<div className='event-detail-modal-item'>
					<label>Описание:</label>
					<p>{event.description}</p>
				</div>
				<div className='event-detail-modal-item'>
					<label>Дата события:</label>
					<p>{formatDate(event.event_date)}</p>
				</div>
				<div className='event-detail-modal-item'>
					<label>Тип мероприятия:</label>
					<p>{event.event_type}</p>
				</div>
				<div className='event-detail-modal-item'>
					<label>Вид мероприятия:</label>
					<p>{event.event_kind}</p>
				</div>
				<div className='event-detail-modal-item'>
					<label>Дата начала:</label>
					<p>{formatDate(event.start_date)}</p>
				</div>
				<div className='event-detail-modal-item'>
					<label>Дата окончания:</label>
					<p>{formatDate(event.end_date)}</p>
				</div>
				<div className='event-detail-modal-item'>
					<label>Статус:</label>
					<p>{event.status ? 'Активен' : 'Неактивен'}</p>
				</div>
				<div className='event-detail-modal-item'>
					<label>Отделы:</label>
					<p>{event.departments.join(', ')}</p>
				</div>
				<div className='event-detail-modal-item'>
					<label>Пользователи для уведомления:</label>
					<p>{event.notified_users.join(', ')}</p>
				</div>
				<div className='event-detail-modal-item'>
					<label>Создано:</label>
					<p>{formatDate(event.created_at)}</p>
				</div>
			</div>
			<button className='event-detail-modal-close-button' onClick={onClose}>
				Закрыть
			</button>
		</Modal>
	)
}

export default EventDetailModal
