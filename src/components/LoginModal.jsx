import React, { useState } from 'react'
import Modal from './AuthModal'
import { login } from '../utils/api'
import './loginModal.css'

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async e => {
		e.preventDefault()
		try {
			const data = await login({ login: username, password })

			localStorage.setItem(
				'user',
				JSON.stringify({
					id: data.user.id_user,
					login: data.user.login_users,
					role: data.user.user_role,
					departmentId: data.user.id_department, // Важно сохранить ID отдела
					departmentName: data.user.department_name, // Для отображения
				})
			)

			onLoginSuccess(data)
		} catch (err) {
			// Обработка ошибок
		}
	}

	return (
		<Modal className='modal-auth' isOpen={isOpen} onClose={onClose}>
			<div className='auth-div'>
				<h2 className='auth-title'>Авторизация</h2>
			</div>
			{error && <div className='error'>{error}</div>}
			<form onSubmit={handleSubmit}>
				<div className='input-form-div'>
					<div className='div-auth-suptitle'>Имя входа</div>
					<input
						className='input-auth'
						type='text'
						value={username}
						onChange={e => setUsername(e.target.value)}
						required
						autoComplete='username'
					/>
				</div>
				<div className='input-form-div'>
					<div className='div-auth-suptitle-pass'>Пароль</div>
					<input
						className='input-auth'
						type='password'
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
						autoComplete='current-password'
					/>
				</div>
				<div className='div-forget-checkbox'>
					<input type='checkbox' className='checkbox-forget' />
					<label>запомнить на сутки</label>
				</div>
				<div className='bottom-auth'>
					<button className='sign-in-btn' type='submit' disabled={isLoading}>
						{isLoading ? 'Вход...' : 'ВОЙТИ'}
					</button>
				</div>
			</form>
		</Modal>
	)
}

export default LoginModal
