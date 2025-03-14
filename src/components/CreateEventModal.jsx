import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import Select from "react-select";

// Устанавливаем корневой элемент для модального окна
Modal.setAppElement("#root");

const CreateEventModal = ({
  isOpen,
  onRequestClose,
  onSubmit,
  title,
  setTitle,
  description,
  setDescription,
  eventDate,
  setEventDate,
  eventType,
  setEventType,
  eventKind,
  setEventKind,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  status,
  setStatus,
  departments,
  setDepartments,
  notifiedUsers,
  setNotifiedUsers,
}) => {
  const [allDepartments, setAllDepartments] = useState([]); // Все отделы
  const [selectedDepartments, setSelectedDepartments] = useState([]); // Выбранные отделы
  const [usersInSelectedDepartments, setUsersInSelectedDepartments] = useState(
    []
  ); // Пользователи в выбранных отделах
  const [loadingDepartments, setLoadingDepartments] = useState(false); // Состояние загрузки отделов
  const [loadingUsers, setLoadingUsers] = useState(false); // Состояние загрузки пользователей
  const [error, setError] = useState(null); // Ошибки

  // Загрузка отделов при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setLoadingDepartments(true);
      axios
        .get("http://localhost:3000/departments")
        .then((response) => {
          setAllDepartments(response.data);
          setError(null);
        })
        .catch((error) => {
          console.error("Error fetching departments:", error);
          setError("Ошибка при загрузке отделов");
        })
        .finally(() => {
          setLoadingDepartments(false);
        });
    }
  }, [isOpen]);

  // Загрузка пользователей при изменении выбранных отделов
  useEffect(() => {
    if (selectedDepartments.length > 0) {
      setLoadingUsers(true);
      axios
        .get(
          `http://localhost:3000/users?department_id=${selectedDepartments.join(
            ","
          )}`
        )
        .then((response) => {
          setUsersInSelectedDepartments(response.data);
          setError(null);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
          setError("Ошибка при загрузке пользователей");
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    } else {
      setUsersInSelectedDepartments([]);
    }
  }, [selectedDepartments]);

  // Обработка отправки формы
  const handleSubmit = () => {
    if (
      !title ||
      !eventDate ||
      !eventType ||
      !eventKind ||
      !startDate ||
      !endDate
    ) {
      setError("Заполните все обязательные поля");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Дата начала не может быть позже даты окончания");
      return;
    }

    if (selectedDepartments.length === 0) {
      setError("Выберите хотя бы один отдел");
      return;
    }

    onSubmit({
      title,
      description,
      eventDate,
      eventType,
      eventKind,
      startDate,
      endDate,
      status,
      departments: selectedDepartments,
      notifiedUsers,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Создать событие"
      className="modal"
      overlayClassName="overlay"
    >
      <button className="close-button" onClick={onRequestClose}>
        ×
      </button>
      <h3>Создание нового события</h3>
      {error && <div className="error-message">{error}</div>}
      <div className="two-parts-events-edit">
        <div className="one-of-part-events-edit">
          {/* Заголовок */}
          <div className="flex-items">
            <label className="label-title">Заголовок:</label>
            <input
              className="input-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Тип мероприятия */}
          <div className="flex-items">
            <label className="label-event-type">Тип мероприятия:</label>
            <select
              className="input-event-type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              required
            >
              <option value="online">Онлайн</option>
              <option value="offline">Офлайн</option>
            </select>
          </div>

          {/* Вид мероприятия */}
          <div className="flex-items">
            <label className="label-event-kind">Вид мероприятия:</label>
            <select
              className="input-event-kind"
              value={eventKind}
              onChange={(e) => setEventKind(e.target.value)}
              required
            >
              <option value="conference">Конференция</option>
              <option value="call">Созвон</option>
              <option value="meeting">Сбор</option>
              <option value="hall_event">Мероприятие в актовом зале</option>
            </select>
          </div>

          {/* Дата начала */}
          <div className="flex-items">
            <label className="label-start-date">Дата начала:</label>
            <input
              className="input-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* Дата окончания */}
          <div className="flex-items">
            <label className="label-end-date">Дата окончания:</label>
            <input
              className="input-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {/* Статус */}
          <div className="flex-items">
            <label className="label-status">Статус:</label>
            <input
              className="input-status"
              type="checkbox"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
            />
          </div>

          {/* Выбор отделов */}
          <div className="flex-items">
            <label className="label-departments">Отделы:</label>
            {loadingDepartments ? (
              <p>Загрузка отделов...</p>
            ) : allDepartments.length > 0 ? (
              <Select
                isMulti
                options={allDepartments.map((department) => ({
                  value: department.id_department,
                  label: department.department_name,
                }))}
                value={selectedDepartments.map((id) => ({
                  value: id,
                  label: allDepartments.find((dep) => dep.id_department === id)
                    .department_name,
                }))}
                onChange={(selectedOptions) => {
                  setSelectedDepartments(
                    selectedOptions.map((option) => option.value)
                  );
                }}
                placeholder="Выберите отделы"
                styles={{
                  control: (base) => ({
                    ...base,
                    width: "100%",
                    borderRadius: "4px",
                  }),
                }}
              />
            ) : (
              <p>Отделы не загружены</p>
            )}
          </div>

          {/* Выбор пользователей */}
          <div className="flex-items">
            <label className="label-notified-users">Пользователи:</label>
            {loadingUsers ? (
              <p>Загрузка пользователей...</p>
            ) : usersInSelectedDepartments.length > 0 ? (
              usersInSelectedDepartments.map((user) => (
                <div key={user.id_user}>
                  <input
                    type="checkbox"
                    id={`user-${user.id_user}`}
                    checked={notifiedUsers.includes(user.id_user)}
                    onChange={() => {
                      setNotifiedUsers((prev) =>
                        prev.includes(user.id_user)
                          ? prev.filter((id) => id !== user.id_user)
                          : [...prev, user.id_user]
                      );
                    }}
                  />
                  <label htmlFor={`user-${user.id_user}`}>
                    {user.user_name} ({user.user_email})
                  </label>
                </div>
              ))
            ) : (
              <p>Пользователи не загружены</p>
            )}
          </div>

          {/* Кнопка создания */}
          <button className="button-event-edit" onClick={handleSubmit}>
            Создать
          </button>
        </div>

        {/* Описание мероприятия */}
        <textarea
          placeholder="Описание мероприятия"
          className="input-description-create"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default CreateEventModal;
