// CreateEventModal.js
import React from 'react'
import Modal from 'react-modal'

Modal.setAppElement('#root') // Установите корневой элемент для модального окна

const CreateEventModal = ({
	isOpen,
	onRequestClose,
	onSubmit,
	title,
	setTitle,
	description,
	setDescription,
	eventDate,
	setEventDate,
	eventType,
	setEventType,
	eventKind,
	setEventKind,
	startDate,
	setStartDate,
	endDate,
	setEndDate,
	status,
	setStatus,
	departments,
	setDepartments,
	notifiedUsers,
	setNotifiedUsers,
}) => {
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
						<label className='label-departments'>Отделы (через запятую):</label>
						<input
							className='input-departments'
							type='text'
							value={departments}
							onChange={e => setDepartments(e.target.value.split(','))}
						/>
					</div>
					<div className='flex-items'>
						<label className='label-notified-users'>Пользователи:</label>
						<input
							className='input-notified-users'
							type='text'
							value={notifiedUsers}
							onChange={e => setNotifiedUsers(e.target.value.split(','))}
						/>
					</div>
					<button className='button-event-edit' onClick={onSubmit}>
						Создать
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

export default CreateEventModal
