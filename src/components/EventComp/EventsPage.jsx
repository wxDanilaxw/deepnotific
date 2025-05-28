import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
	fetchEvents,
	deleteEvent,
	fetchCategories,
	fetchDepartments,
} from '../../api/eventApi'

import EventItem from './EventItem'
import EventModal from './EventModal'
import EditEventModal from './EditEventModal'
import DeleteEventModal from './DeleteEventModal'
import './styles.css'

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const monthNames = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
]

const EventsPage = () => {
	const [events, setEvents] = useState([])
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [editingEvent, setEditingEvent] = useState(null)
	const [deletingEvent, setDeletingEvent] = useState(null)
	const [categories, setCategories] = useState([])
	const [departments, setDepartments] = useState([])
	const [showStats, setShowStats] = useState(false)

	// Поиск и фильтры
	const [search, setSearch] = useState('')
	const [filterStatus, setFilterStatus] = useState('')
	const [filterDepartment, setFilterDepartment] = useState('')
	const [filterDateFrom, setFilterDateFrom] = useState('')
	const [filterDateTo, setFilterDateTo] = useState('')

	const now = new Date()
	const [selectedYear, setSelectedYear] = useState(now.getFullYear())
	const [selectedMonth, setSelectedMonth] = useState(now.getMonth())

	const chartRef = useRef(null)

	useEffect(() => {
		loadData()
	}, [])

	const loadData = async () => {
		try {
			const [eventsData, categoriesData, departmentsData] = await Promise.all([
				fetchEvents(),
				fetchCategories().catch(() => []),
				fetchDepartments().catch(() => []),
			])

			const now = new Date()

			const updatedEvents = eventsData.map(event => {
				const start = new Date(event.start_datetime || event.event_date)
				const end = new Date(
					event.end_datetime || event.start_datetime || event.event_date
				)

				let status = event.status

				if (end < now) {
					status = 'архив'
				} else if (start > now) {
					status = 'запланировано'
				} else {
					status = 'действительно'
				}

				return { ...event, status }
			})

			setEvents(updatedEvents)
			setCategories(categoriesData)
			setDepartments(departmentsData)
		} catch (error) {
			console.error('Error loading data:', error)
		}
	}

	const handleDeleteConfirm = async () => {
		try {
			await deleteEvent(deletingEvent.id_event)
			loadData()
			setDeletingEvent(null)
		} catch (error) {
			console.error('Error deleting event:', error)
		}
	}

	// --- Фильтрация и поиск ---
	const filteredEvents = events.filter(event => {
		// Поиск по названию
		if (
			search &&
			!event.event_name.toLowerCase().includes(search.toLowerCase())
		) {
			return false
		}
		// Фильтр по статусу
		if (filterStatus && event.status !== filterStatus) {
			return false
		}
		// Фильтр по отделу
		if (filterDepartment && String(event.id_department) !== filterDepartment) {
			return false
		}
		// Фильтр по дате (диапазон)
		const eventDate = event.start_datetime
			? new Date(event.start_datetime)
			: null
		if (filterDateFrom && eventDate && eventDate < new Date(filterDateFrom)) {
			return false
		}
		if (filterDateTo && eventDate && eventDate > new Date(filterDateTo)) {
			return false
		}
		return true
	})

	const getStatsData = () => {
		const filteredEvents = events.filter(event => {
			if (!event.start_datetime) return false
			const date = new Date(event.start_datetime)
			return (
				date.getFullYear() === selectedYear && date.getMonth() === selectedMonth
			)
		})

		const counts = {}

		filteredEvents.forEach(event => {
			const date = new Date(event.start_datetime)
			const day = date.getDate()
			counts[day] = (counts[day] || 0) + 1
		})

		const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
		const data = []
		for (let day = 1; day <= daysInMonth; day++) {
			data.push({
				day: day.toString(),
				count: counts[day] || 0,
			})
		}

		return data
	}

	const getAvailableYears = () => {
		const yearsSet = new Set(
			events
				.map(event => {
					if (!event.start_datetime) return null
					return new Date(event.start_datetime).getFullYear()
				})
				.filter(Boolean)
		)
		const years = Array.from(yearsSet).sort((a, b) => b - a)
		return years.length ? years : [now.getFullYear()]
	}

	const exportToExcel = () => {
		const eventsSheetData = events.map(event => ({
			'ID события': event.id_event,
			Название: event.event_name,
			Описание: event.description,
			'Дата начала': event.start_datetime
				? new Date(event.start_datetime).toLocaleString()
				: '',
			'Дата окончания': event.end_datetime
				? new Date(event.end_datetime).toLocaleString()
				: '',
			Место: event.location,
			Категория:
				categories.find(c => c.id_category === event.id_category)
					?.category_name || '',
			Отдел:
				departments.find(d => d.id_department === event.id_department)
					?.department_name || '',
			Статус: event.status,
		}))

		const counts = {}
		events.forEach(event => {
			if (!event.start_datetime) return
			const dateStr = new Date(event.start_datetime).toISOString().slice(0, 10)
			counts[dateStr] = (counts[dateStr] || 0) + 1
		})

		const summarySheetData = Object.entries(counts)
			.map(([date, count]) => ({ Дата: date, 'Количество событий': count }))
			.sort((a, b) => a['Дата'].localeCompare(b['Дата']))

		const wb = XLSX.utils.book_new()
		const wsEvents = XLSX.utils.json_to_sheet(eventsSheetData)
		XLSX.utils.book_append_sheet(wb, wsEvents, 'События')
		const wsSummary = XLSX.utils.json_to_sheet(summarySheetData)
		XLSX.utils.book_append_sheet(wb, wsSummary, 'Статистика')

		const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
		const blob = new Blob([wbout], { type: 'application/octet-stream' })
		saveAs(
			blob,
			`events_statistics_${new Date().toISOString().slice(0, 10)}.xlsx`
		)
	}

	const exportChartAsImage = () => {
		if (!chartRef.current) return

		const svg = chartRef.current.container.children[0]
		const svgData = new XMLSerializer().serializeToString(svg)
		const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
		const url = URL.createObjectURL(svgBlob)

		const image = new Image()
		image.onload = () => {
			const canvas = document.createElement('canvas')
			canvas.width = image.width
			canvas.height = image.height
			const context = canvas.getContext('2d')
			context.fillStyle = '#fff'
			context.fillRect(0, 0, canvas.width, canvas.height)
			context.drawImage(image, 0, 0)
			URL.revokeObjectURL(url)

			canvas.toBlob(blob => {
				saveAs(blob, `chart_${selectedYear}_${selectedMonth + 1}.png`)
			})
		}
		image.src = url
	}

	return (
		<div className='admin-container'>
			<Link to='/' className='back-button'>
				← На главную
			</Link>

			<div className='header-section'>
				<h2 className='admin-title'>Управление событиями</h2>
				<div className='event-count'>Всего событий: {events.length}</div>
				<button
					className='create-event-button'
					onClick={() => setIsCreateModalOpen(true)}
				>
					Создать событие
				</button>
				<button
					className='stats-button'
					style={{ marginLeft: '10px' }}
					onClick={() => setShowStats(prev => !prev)}
				>
					{showStats ? 'Скрыть статистику' : 'Показать статистику'}
				</button>
			</div>

			{/* --- Поиск и фильтры --- */}
			<div
				className='filters-block'
				style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}
			>
				<input
					type='text'
					placeholder='Поиск по названию'
					value={search}
					onChange={e => setSearch(e.target.value)}
					style={{
						padding: 8,
						borderRadius: 6,
						border: '1.5px solid #e3e5ef',
						minWidth: 180,
					}}
				/>
				<select
					value={filterStatus}
					onChange={e => setFilterStatus(e.target.value)}
					style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e3e5ef' }}
				>
					<option value=''>Все статусы</option>
					<option value='запланировано'>Запланировано</option>
					<option value='действительно'>Действительно</option>
					<option value='архив'>Архив</option>
				</select>
				<select
					value={filterDepartment}
					onChange={e => setFilterDepartment(e.target.value)}
					style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e3e5ef' }}
				>
					<option value=''>Все отделы</option>
					{departments.map(dep => (
						<option key={dep.id_department} value={dep.id_department}>
							{dep.department_name}
						</option>
					))}
				</select>
				<input
					type='date'
					value={filterDateFrom}
					onChange={e => setFilterDateFrom(e.target.value)}
					style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e3e5ef' }}
					placeholder='Дата с'
				/>
				<input
					type='date'
					value={filterDateTo}
					onChange={e => setFilterDateTo(e.target.value)}
					style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e3e5ef' }}
					placeholder='Дата по'
				/>
				<button
					onClick={() => {
						setSearch('')
						setFilterStatus('')
						setFilterDepartment('')
						setFilterDateFrom('')
						setFilterDateTo('')
					}}
					style={{
						padding: 8,
						borderRadius: 6,
						background: '#f44336',
						color: '#fff',
						border: 'none',
					}}
				>
					Сбросить фильтры
				</button>
			</div>

			{showStats && (
				<div className='stats-controls' style={{ marginBottom: 10 }}>
					<label>
						Год:{' '}
						<select
							value={selectedYear}
							onChange={e => setSelectedYear(Number(e.target.value))}
						>
							{getAvailableYears().map(year => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</label>
					<label style={{ marginLeft: 20 }}>
						Месяц:{' '}
						<select
							value={selectedMonth}
							onChange={e => setSelectedMonth(Number(e.target.value))}
						>
							{monthNames.map((name, index) => (
								<option key={index} value={index}>
									{name}
								</option>
							))}
						</select>
					</label>
					<button
						className='export-excel-button'
						style={{ marginLeft: '10px' }}
						onClick={exportToExcel}
					>
						Экспорт в Excel
					</button>
					<button
						className='export-chart-button'
						style={{ marginLeft: '10px' }}
						onClick={exportChartAsImage}
					>
						Экспорт диаграммы
					</button>
				</div>
			)}

			{showStats && (
				<div
					className='stats-container'
					style={{ width: '100%', height: 300, marginBottom: 20 }}
				>
					<ResponsiveContainer width='100%' height='100%'>
						<BarChart data={getStatsData()} ref={chartRef}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='day' />
							<YAxis allowDecimals={false} />
							<Tooltip />
							<Bar dataKey='count' fill='#82ca9d' />
						</BarChart>
					</ResponsiveContainer>
				</div>
			)}

			<div className='event-list'>
				{filteredEvents.map(event => (
					<EventItem
						key={event.id_event}
						event={event}
						categories={categories}
						departments={departments}
						onEdit={setEditingEvent}
						onDelete={setDeletingEvent}
					/>
				))}
			</div>

			{isCreateModalOpen && (
				<EventModal
					categories={categories}
					departments={departments}
					onClose={() => setIsCreateModalOpen(false)}
					onSuccess={loadData}
				/>
			)}

			{editingEvent && (
				<EditEventModal
					event={editingEvent}
					categories={categories}
					departments={departments}
					onClose={() => setEditingEvent(null)}
					onSuccess={loadData}
				/>
			)}

			{deletingEvent && (
				<DeleteEventModal
					event={deletingEvent}
					onClose={() => setDeletingEvent(null)}
					onConfirm={handleDeleteConfirm}
				/>
			)}
		</div>
	)
}

export default EventsPage
