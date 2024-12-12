import React, { useState } from 'react'
import Modal from './AuthModal'
import './loginModal.css'

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')

	const handleSubmit = async e => {
		e.preventDefault()

		try {
			console.log('Sending login request with:', {
				login_users: username,
				password_users: password,
			})

			const response = await fetch('http://localhost:3000/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					login_users: username,
					password_users: password,
				}),
			})

			const data = await response.json()

			console.log('Response received:', data)

			if (response.ok) {
				console.log('Login successful:', data)
				setSuccessMessage('Вход выполнен успешно!')
				setError('') // Очищаем сообщение об ошибке
				setTimeout(() => {
					onLoginSuccess(data.user) // Передаем данные пользователя
					onClose()
				}, 2000) // Закрываем модальное окно через 2 секунды
			} else {
				setError('Неправильный логин или пароль')
				setSuccessMessage('') // Очищаем сообщение об успехе
			}
		} catch (err) {
			console.error('Error during login:', err)
			setError('Произошла ошибка при входе')
			setSuccessMessage('') // Очищаем сообщение об успехе
		}
	}

	return (
		<div>
			<Modal className='modal-auth' isOpen={isOpen} onClose={onClose}>
				<div className='auth-div'>
					<h2 className='auth-title'>Авторизация</h2>
				</div>
				{error && <div className='error'>{error}</div>}
				{successMessage && <div className='success'>{successMessage}</div>}
				<form onSubmit={handleSubmit}>
					<div className='input-form-div'>
						<div className='div-auth-suptitle'>Имя входа</div>
						<input
							className='input-auth'
							type='text'
							id='username'
							value={username}
							onChange={e => setUsername(e.target.value)}
						/>
					</div>
					<div className='input-form-div'>
						<div className='div-auth-suptitle-pass'>Пароль</div>
						<input
							className='input-auth'
							type='password'
							id='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
						/>
					</div>
					<div className='div-forget-checkbox'>
						<input type='checkbox' className='checkbox-forget'></input>
						<label>запомнить на сутки</label>
					</div>
					<div className='bottom-auth'>
						<button className='sign-in-btn' type='submit'>
							ВОЙТИ
						</button>
					</div>
				</form>
			</Modal>
		</div>
	)
}

export default LoginModal
