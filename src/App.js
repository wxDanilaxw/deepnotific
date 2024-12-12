import React from 'react'
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from 'react-router-dom'
import Main from './pages/main'
import AdminPage from './pages/AdminPage'
import './App.css'

const App = () => {
	const isAdmin = () => {
		// Проверяем, является ли пользователь администратором
		const userRole = localStorage.getItem('userRole')
		return userRole === 'admin'
	}

	return (
		<Router>
			<Routes>
				<Route path='/' element={<Main />} />
				<Route
					path='/adminpanel'
					element={isAdmin() ? <AdminPage /> : <Navigate to='/' replace />}
				/>
			</Routes>
		</Router>
	)
}

export default App
