// App.js
import React from 'react'
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
	Link,
} from 'react-router-dom'
import Main from './pages/main'
import EventsPage from './components/EventComp/EventsPage'
import './App.css'

const App = () => {
	const isAdmin = () => {
		const userRole = localStorage.getItem('userRole')
		return userRole === 'admin'
	}

	// Для теста: автоматическая установка роли
	React.useEffect(() => {
		localStorage.setItem('userRole', 'admin')
	}, [])

	return (
		<Router>
			<Routes>
				<Route
					path='/'
					element={
						<>
							<Main />
							{isAdmin() && (
								<button
									onClick={() => (window.location.href = '/events')}
									className='events-button'
								>
									Управление событиями
								</button>
							)}
						</>
					}
				/>
				<Route
					path='/events'
					element={isAdmin() ? <EventsPage /> : <Navigate to='/' replace />}
				/>
			</Routes>
		</Router>
	)
}

export default App
