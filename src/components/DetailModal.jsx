import React from 'react'
import './DetailModal.css'

const DetailModal = ({ isOpen, onClose, children }) => {
	if (!isOpen) return null
	return (
		<div className='modal-overlay1'>
			<div className='modal-content1'>
				<button className='modal-close1' onClick={onClose}>
					&times;
				</button>
				{children}
			</div>
		</div>
	)
}

export default DetailModal
