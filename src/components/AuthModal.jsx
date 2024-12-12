import React from 'react'
import './AuthModal.css'

const AuthModal = ({ isOpen, onClose, children }) => {
	if (!isOpen) return null
	return (
		<div className='modal-overlay'>
			<div className='modal-content'>
				<button className='modal-close' onClick={onClose}>
					&times;
				</button>
				{children}
			</div>
		</div>
	)
}

export default AuthModal
