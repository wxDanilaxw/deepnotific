const jwt = require('jsonwebtoken')

const JWT_SECRET = 'your-super-secret-key-123'

module.exports = (req, res, next) => {
	try {
		const authHeader = req.headers.authorization
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ error: 'Authentication required' })
		}

		const token = authHeader.split(' ')[1]
		const decoded = jwt.verify(token, JWT_SECRET)

		// Mock-проверка пользователя (в реальности тут запрос к БД)
		req.user = {
			id: decoded.userId,
			role: decoded.userId === 1 ? 'admin' : 'user',
		}

		next()
	} catch (err) {
		if (err.name === 'JsonWebTokenError') {
			return res.status(401).json({ error: 'Invalid token' })
		}
		res.status(500).json({ error: 'Server error' })
	}
}
