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
	console.log('Подключение установлено')
	release()
})

// Обслуживание статических файлов из папки build
app.use(express.static('C:/Users/dpron/OneDrive/Desktop/notific/notific/build'))

// Маршрут для корневого URL
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/build/index.html')
})

// Создание таблицы events, если она не существует
pool.query(
	`
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
        departments TEXT[] NOT NULL,
        notified_users INTEGER[] NOT NULL
    );
`,
	(err, res) => {
		if (err) {
			console.error('Ошибка при создании таблицы events:', err)
		} else {
			console.log('Таблица events создана или уже существует')
		}
	}
)

// Вставка данных в таблицу events
pool.query(
	`
    INSERT INTO events (title, description, event_date, event_type, event_kind, start_date, end_date, status, departments, notified_users) VALUES
    ('Конференция 2023', 'Международная конференция по технологиям', '2024-11-15', 'Очное', 'Конференция', '2024-11-15', '2024-11-17', TRUE, ARRAY['IT', 'HR'], ARRAY[1, 2, 3]),
    ('День рождения', 'Празднование дня рождения', '2023-10-30', 'Заочное', 'Праздник', '2023-10-30', '2023-10-30', TRUE, ARRAY['Sales', 'Marketing'], ARRAY[4, 5]),
    ('Хотите', 'Хотите', '2024-10-30', 'Онлайн', 'Вебинар', '2024-10-30', '2024-10-30', TRUE, ARRAY['Finance'], ARRAY[6])
    ON CONFLICT DO NOTHING;
`,
	(err, res) => {
		if (err) {
			console.error('Ошибка при вставке данных:', err)
		} else {
			console.log('Данные вставлены или уже существуют')
		}
	}
)

// Получение всех мероприятий
app.get('/events', async (req, res) => {
	console.log('GET /events request received')
	const eventDate = req.query.event_date // Получаем дату из запроса
	try {
		let query = 'SELECT * FROM events'
		let params = []

		if (eventDate) {
			query += ' WHERE event_date = $1'
			params.push(eventDate)
		}

		const { rows } = await pool.query(query, params)
		console.log('Events retrieved:', rows)
		res.json(rows)
	} catch (err) {
		console.error('Error fetching events:', err)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

// Получение мероприятия по ID
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

// Маршрут для создания нового события (только для администраторов)
app.post('/events', async (req, res) => {
	console.log('POST /events request received')
	console.log('Request Body:', req.body) // Логируем тело запроса

	const {
		title,
		description,
		event_date,
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
		!event_date ||
		!event_type ||
		!event_kind ||
		!start_date ||
		!end_date ||
		!departments ||
		!notified_users
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

	// Проверка корректности массивов departments и notified_users
	if (!Array.isArray(departments) || !Array.isArray(notified_users)) {
		console.log(
			'Validation error: Departments and notified_users must be arrays'
		)
		return res.status(400).json({
			error: 'Validation error: Departments and notified_users must be arrays',
		})
	}

	try {
		// Вставка данных в таблицу events
		const { rows } = await pool.query(
			`
            INSERT INTO events (
                title, 
                description, 
                event_date, 
                event_type, 
                event_kind, 
                start_date, 
                end_date, 
                status, 
                departments, 
                notified_users
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *
            `,
			[
				title,
				description,
				event_date,
				event_type,
				event_kind,
				start_date,
				end_date,
				status || true, // По умолчанию статус true, если не указан
				departments,
				notified_users,
			]
		)

		console.log('Event creatxed:', rows[0])
		res
			.status(201)
			.json({ message: 'Event created successfully', event: rows[0] })
	} catch (err) {
		console.error('Error creating event:', err)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

// Маршрут для обновления события (только для администраторов)
app.put('/events/:id', async (req, res) => {
	const { id } = req.params
	const {
		title,
		description,
		event_date,
		event_type,
		event_kind,
		start_date,
		end_date,
		status,
		departments,
		notified_users,
		user_role,
	} = req.body
	console.log(`PUT /events/${id} request received`)

	// Проверка роли пользователя
	if (user_role !== 'admin') {
		console.log('Access denied: User is not an admin')
		return res
			.status(403)
			.json({ error: 'Access denied: User is not an admin' })
	}

	try {
		const { rows } = await pool.query(
			'UPDATE events SET title = $1, description = $2, event_date = $3, event_type = $4, event_kind = $5, start_date = $6, end_date = $7, status = $8, departments = $9, notified_users = $10 WHERE id = $11 RETURNING *',
			[
				title,
				description,
				event_date,
				event_type,
				event_kind,
				start_date,
				end_date,
				status,
				departments,
				notified_users,
				id,
			]
		)
		if (rows.length === 0) {
			console.log(`Event with id ${id} не найден`)
			res.status(404).json({ error: 'Event not found' })
		} else {
			console.log(`Event with id ${id} updated:`, rows[0])
			res.json({ message: 'Event updated', event: rows[0] })
		}
	} catch (err) {
		console.error(`Error updating event with id ${id}:`, err)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

// Маршрут для удаления события (только для администраторов)
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
	console.log(`Сервер запущен на port ${PORT}`)
})
