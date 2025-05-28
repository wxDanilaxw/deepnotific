const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

// Жёстко заданные тестовые пользователи
const MOCK_USERS = [
	{ id: 1, login: 'admin', password: 'admin123', role: 'admin' },
	{ id: 2, login: 'user', password: 'user123', role: 'user' },
]

const JWT_SECRET = 'your-super-secret-key-123'

router.post('/login', (req, res) => {
	const { login, password } = req.body

	const user = MOCK_USERS.find(
		u => u.login === login && u.password === password
	)

	if (!user) {
		return res.status(401).json({ error: 'Invalid credentials' })
	}

	const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })

	res.json({
		token,
		user: { id: user.id, role: user.role },
	})
})

module.exports = router
