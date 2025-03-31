const express = require('express')
const { Pool } = require('pg')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

// Настройки подключения к базе данных
const pool = new Pool({
	user: 'postgres', // Имя пользователя базы данных
	host: 'localhost', // Хост базы данных
	database: 'postgres', // Имя базы данных
	password: '1234', // Пароль базы данных
	port: 5432, // Порт базы данных
})

// Проверка подключения к базе данных
pool.connect((err, client, release) => {
	if (err) {
		return console.error('Ошибка при получении клиента', err.stack)
	}
	console.log('Подключение к базе данных установлено')
	release()
})

// Обслуживание статических файлов из папки build
app.use(express.static('C:/Users/dpron/OneDrive/Desktop/notific/notific/build'))

// Маршрут для получения пользователей по department_id
app.get('/users', async (req, res) => {
	const { department_id } = req.query
	console.log('GET /users request received with department_id:', department_id)

	try {
		let query = 'SELECT * FROM users'
		let params = []

		if (department_id) {
			query += ' WHERE id_department = ANY($1::int[])'
			params.push(department_id.split(',').map(Number))
		}

		const { rows } = await pool.query(query, params)
		console.log('Users retrieved:', rows)
		res.json(rows)
	} catch (err) {
		console.error('Error fetching users:', err)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

// Маршрут для корневого URL
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/build/index.html')
})

// Создание таблиц при запуске сервера
const createTables = async () => {
	try {
		await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id_department SERIAL PRIMARY KEY,
        department_name VARCHAR(100) NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS users (
        id_user SERIAL PRIMARY KEY,
        login_users VARCHAR(100) NOT NULL UNIQUE,
        password_users VARCHAR(100) NOT NULL,
        user_role VARCHAR(50) NOT NULL DEFAULT 'user'
      );

      CREATE TABLE IF NOT EXISTS user_departments (
        id_user INT REFERENCES users(id_user) ON DELETE CASCADE,
        id_department INT REFERENCES departments(id_department) ON DELETE CASCADE,
        PRIMARY KEY (id_user, id_department)
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        event_date DATE NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        event_kind VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status BOOLEAN NOT NULL DEFAULT TRUE,
        notified_users INTEGER[] DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS event_departments (
        id_event INT REFERENCES events(id) ON DELETE CASCADE,
        id_department INT REFERENCES departments(id_department) ON DELETE CASCADE,
        PRIMARY KEY (id_event, id_department)
      );
    `)
		console.log('Таблицы созданы или уже существуют')
	} catch (err) {
		console.error('Ошибка при создании таблиц:', err)
	}
}

// Вызов функции создания таблиц
createTables()

// Маршрут для получения всех отделов
app.get('/departments', async (req, res) => {
	console.log('GET /departments request received')
	try {
		const { rows } = await pool.query('SELECT * FROM departments')
		console.log('Departments retrieved:', rows)
		res.json(rows)
	} catch (err) {
		console.error('Error fetching departments:', err)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

// Маршрут для получения всех событий
app.get('/events', async (req, res) => {
	console.log('GET /events request received')
	const eventDate = req.query.event_date // Получаем дату из запроса
	try {
		let query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_type,
        e.event_kind,
        e.start_date,
        e.end_date,
        e.status,
        COALESCE(ARRAY_AGG(u.login_users) FILTER (WHERE u.login_users IS NOT NULL), '{}') AS notified_users,
        COALESCE(ARRAY_AGG(d.department_name) FILTER (WHERE d.department_name IS NOT NULL), '{}') AS departments
      FROM events e
      LEFT JOIN event_departments ed ON e.id = ed.id_event
      LEFT JOIN departments d ON ed.id_department = d.id_department
      LEFT JOIN users u ON u.id_user = ANY(e.notified_users)
    `

		let params = []

		if (eventDate) {
			query += ' WHERE e.event_date = $1'
			params.push(eventDate)
		}

		query += ' GROUP BY e.id' // Группируем по ID события

		const { rows } = await pool.query(query, params)
		console.log('Events retrieved:', rows)
		res.json(rows)
	} catch (err) {
		console.error('Error fetching events:', err)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

// Маршрут для получения события по ID
app.get('/events/:id', async (req, res) => {
	const { id } = req.params
	console.log(`GET /events/${id} request received`)
	try {
		const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [
			id,
		])
		if (rows.length === 0) {
			console.log(`Event with id ${id} не найден`)
			res.status(404).json({ error: 'Event not found' })
		} else {
			console.log(`Event with id ${id} retrieved:`, rows[0])
			res.json(rows[0])
		}
	} catch (err) {
		console.error(`Error fetching event with id ${id}:`, err)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

// Маршрут для авторизации
app.post('/login', async (req, res) => {
	const { login_users, password_users } = req.body
	console.log('POST /login request received')
	try {
		const { rows } = await pool.query(
			'SELECT * FROM users WHERE login_users = $1 AND password_users = $2',
			[login_users, password_users]
		)
		if (rows.length === 0) {
			console.log('Login failed: User not found')
			res.status(401).json({ error: 'Invalid credentials' })
		} else {
			console.log('Login successful:', rows[0])
			res.json({ message: 'Login successful', user: rows[0] })
		}
	} catch (err) {
		console.error('Error during login:', err)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

// Маршрут для создания нового события
app.post('/events', async (req, res) => {
	console.log('POST /events request received')
	console.log('Request Body:', req.body)

	const {
		title,
		description,
		event_type,
		event_kind,
		start_date,
		end_date,
		status,
		departments,
		notified_users,
		user_role,
	} = req.body

	// Проверка роли пользователя
	if (user_role !== 'admin') {
		console.log('Access denied: User is not an admin')
		return res
			.status(403)
			.json({ error: 'Access denied: User is not an admin' })
	}

	// Проверка на пустые значения обязательных полей
	if (
		!title ||
		!event_type ||
		!event_kind ||
		!start_date ||
		!end_date ||
		!departments
	) {
		console.log('Validation error: Missing required fields')
		return res
			.status(400)
			.json({ error: 'Validation error: Missing required fields' })
	}

	// Проверка корректности дат
	if (new Date(start_date) > new Date(end_date)) {
		console.log('Validation error: Start date cannot be after end date')
		return res
			.status(400)
			.json({ error: 'Validation error: Start date cannot be after end date' })
	}

	// Проверка корректности массива departments
	if (!Array.isArray(departments)) {
		console.log('Validation error: Departments must be an array')
		return res
			.status(400)
			.json({ error: 'Validation error: Departments must be an array' })
	}

	try {
		// Начало транзакции
		await pool.query('BEGIN')

		// Вставка данных в таблицу events
		const eventResult = await pool.query(
			`INSERT INTO events (
        title, 
        description, 
        event_type, 
        event_kind, 
        start_date, 
        end_date, 
        status,
        notified_users
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id`,
			[
				title,
				description,
				event_type,
				event_kind,
				start_date,
				end_date,
				status || true,
				notified_users || [],
			]
		)

		const eventId = eventResult.rows[0].id

		// Вставка данных в таблицу event_departments
		for (const departmentId of departments) {
			await pool.query(
				'INSERT INTO event_departments (id_event, id_department) VALUES ($1, $2)',
				[eventId, departmentId]
			)
		}

		// Завершение транзакции
		await pool.query('COMMIT')

		console.log('Event created with ID:', eventId)
		res.status(201).json({ message: 'Event created successfully', eventId })
	} catch (err) {
		// Откат транзакции в случае ошибки
		await pool.query('ROLLBACK')
		console.error('Error creating event:', err)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

// Маршрут для удаления события
app.delete('/events/:id', async (req, res) => {
	const { id } = req.params
	console.log(`DELETE /events/${id} request received`)

	// Проверка роли пользователя
	if (req.body.user_role !== 'admin') {
		console.log('Access denied: User is not an admin')
		return res
			.status(403)
			.json({ error: 'Access denied: User is not an admin' })
	}

	try {
		const { rows } = await pool.query(
			'DELETE FROM events WHERE id = $1 RETURNING *',
			[id]
		)
		if (rows.length === 0) {
			console.log(`Event with id ${id} не найден`)
			res.status(404).json({ error: 'Event not found' })
		} else {
			console.log(`Event with id ${id} deleted:`, rows[0])
			res.json({ message: 'Event deleted', event: rows[0] })
		}
	} catch (err) {
		console.error(`Error deleting event with id ${id}:`, err)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

// Запуск сервера
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Сервер запущен на порту ${PORT}`)
})
