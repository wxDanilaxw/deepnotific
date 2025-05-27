import React from 'react';

const DeleteEventModal = ({ event, onClose, onConfirm }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Подтверждение удаления</h3>
        <p>Вы уверены, что хотите удалить событие "{event.event_name}"?</p>
        
        <div className="modal-actions">
          <button onClick={onClose}>Отмена</button>
          <button onClick={onConfirm} className="delete-btn">Удалить</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventModal;