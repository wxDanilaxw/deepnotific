import React, { useState } from 'react';
import Modal from './AuthModal';
import './loginModal.css';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          login_users: username,
          password_users: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка авторизации');
      }

      if (!data.user) {
        throw new Error('Неверный формат ответа сервера');
      }

      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Неверный логин или пароль');
    } finally {
      setIsLoading(false);
    }
  };

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
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className='input-form-div'>
          <div className='div-auth-suptitle-pass'>Пароль</div>
          <input
            className='input-auth'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <div className='div-forget-checkbox'>
          <input type='checkbox' className='checkbox-forget' />
          <label>запомнить на сутки</label>
        </div>
        <div className='bottom-auth'>
          <button 
            className='sign-in-btn' 
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'ВОЙТИ'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LoginModal;