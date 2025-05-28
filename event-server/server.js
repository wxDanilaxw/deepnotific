require('dotenv').config()
const app = require('./app')
const { pool } = require('./models/db')
const createTables = require('./utils/createTables')

const PORT = process.env.PORT || 3000

const startServer = async () => {
	console.log('⏳ Запуск сервера...')

	try {
		const client = await pool.connect()
		console.log('Подключение к базе данных установлено')
		client.release()

		if (process.env.CREATE_TABLES === 'true') {
			console.log('⚙️  Создание таблиц...')
			await createTables()
		}

		app.listen(PORT, () => {
			console.log(` Сервер запущен на порту ${PORT}`)
			console.log(` Доступен по адресу: http://localhost:${PORT}`)
		})
	} catch (err) {
		console.error(' Критическая ошибка при запуске:', err.message)
		console.error(err.stack)
		process.exit(1)
	}
}

process.on('unhandledRejection', err => {
	console.error('  Необработанное исключение:', err.message)
	console.error(err.stack)
})

process.on('uncaughtException', err => {
	console.error('  Непойманное исключение:', err.message)
	console.error(err.stack)
	process.exit(1)
})

startServer()
