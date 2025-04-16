import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import axios from "axios";
import Select from "react-select";

Modal.setAppElement("#root");

const CreateEventModal = ({ isOpen, onRequestClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "",
    eventKind: "",
    startDate: "",
    endDate: "",
    status: true,
    selectedDepartments: [],
    notifiedUsers: [],
  });

  const [allDepartments, setAllDepartments] = useState([]);
  const [usersInSelectedDepartments, setUsersInSelectedDepartments] = useState(
    []
  );
  const [loading, setLoading] = useState({
    departments: false,
    users: false,
    submitting: false,
  });
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);

  // Проверка соединения с интернетом
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Загрузка отделов
  useEffect(() => {
    if (isOpen && networkStatus) {
      const fetchDepartments = async () => {
        setLoading((prev) => ({ ...prev, departments: true }));
        try {
          const response = await axios.get(
            "http://localhost:3000/departments",
            {
              timeout: 5000,
            }
          );
          setAllDepartments(response.data);
          setError(null);
        } catch (err) {
          console.error("Error fetching departments:", err);
          setError(err.message || "Ошибка при загрузке отделов");
        } finally {
          setLoading((prev) => ({ ...prev, departments: false }));
        }
      };

      fetchDepartments();
    }
  }, [isOpen, networkStatus]);

  // Загрузка пользователей при изменении выбранных отделов
  useEffect(() => {
    if (formData.selectedDepartments.length > 0 && networkStatus) {
      const fetchUsers = async () => {
        setLoading((prev) => ({ ...prev, users: true }));
        try {
          const response = await axios.get(
            `http://localhost:3000/users?department_id=${formData.selectedDepartments.join(
              ","
            )}`,
            { timeout: 5000 }
          );
          setUsersInSelectedDepartments(response.data);
          setError(null);
        } catch (err) {
          console.error("Error fetching users:", err);
          setError(err.message || "Ошибка при загрузке пользователей");
        } finally {
          setLoading((prev) => ({ ...prev, users: false }));
        }
      };

      fetchUsers();
    } else {
      setUsersInSelectedDepartments([]);
    }
  }, [formData.selectedDepartments, networkStatus]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleNext();
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const validateStep = (step) => {
    const {
      title,
      eventType,
      eventKind,
      startDate,
      endDate,
      selectedDepartments,
    } = formData;

    switch (step) {
      case 1:
        if (!title.trim()) {
          setError('Заполните поле "Заголовок"');
          return false;
        }
        break;
      case 2:
        if (!eventType) {
          setError('Выберите "Тип мероприятия"');
          return false;
        }
        break;
      case 3:
        if (!eventKind) {
          setError('Выберите "Вид мероприятия"');
          return false;
        }
        break;
      case 4:
        if (!startDate) {
          setError('Укажите "Дату начала"');
          return false;
        }
        if (new Date(startDate) < new Date()) {
          setError("Дата начала не может быть в прошлом");
          return false;
        }
        break;
      case 5:
        if (!endDate) {
          setError('Укажите "Дату окончания"');
          return false;
        }
        if (new Date(startDate) > new Date(endDate)) {
          setError("Дата начала не может быть позже даты окончания");
          return false;
        }
        break;
      case 6:
        if (selectedDepartments.length === 0) {
          setError("Выберите хотя бы один отдел");
          return false;
        }
        break;
      default:
        break;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!networkStatus) {
      setError("Нет подключения к интернету");
      return;
    }

    if (!validateStep(currentStep)) return;

    setLoading((prev) => ({ ...prev, submitting: true }));

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.eventType,
        event_kind: formData.eventKind,
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: formData.status,
        departments: formData.selectedDepartments,
        notified_users: formData.notifiedUsers,
        user_role: "admin",
      };

      const response = await axios.post(
        "http://localhost:3000/events",
        eventData,
        {
          timeout: 10000,
        }
      );

      console.log("Event created successfully:", response.data);
      onEventCreated();
      onRequestClose();
      resetForm();
    } catch (err) {
      console.error("Error creating event:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Ошибка при создании события"
      );
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventType: "",
      eventKind: "",
      startDate: "",
      endDate: "",
      status: true,
      selectedDepartments: [],
      notifiedUsers: [],
    });
    setCurrentStep(1);
    setError(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step" aria-labelledby="title-label">
            <label id="title-label" className="label-title">
              Заголовок:
            </label>
            <input
              className="input-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              onKeyPress={handleKeyPress}
              required
              aria-required="true"
              aria-invalid={!formData.title}
            />
          </div>
        );
      case 2:
        return (
          <div className="step" aria-labelledby="event-type-label">
            <label id="event-type-label" className="label-event-type">
              Тип мероприятия:
            </label>
            <select
              className="input-event-type"
              value={formData.eventType}
              onChange={(e) => handleInputChange("eventType", e.target.value)}
              onKeyPress={handleKeyPress}
              required
              aria-required="true"
              aria-invalid={!formData.eventType}
            >
              <option value="">Выберите тип</option>
              <option value="online">Онлайн</option>
              <option value="offline">Офлайн</option>
              <option value="remote">Заочное</option>
            </select>
          </div>
        );
      case 3:
        return (
          <div className="step" aria-labelledby="event-kind-label">
            <label id="event-kind-label" className="label-event-kind">
              Вид мероприятия:
            </label>
            <select
              className="input-event-kind"
              value={formData.eventKind}
              onChange={(e) => handleInputChange("eventKind", e.target.value)}
              onKeyPress={handleKeyPress}
              required
              aria-required="true"
              aria-invalid={!formData.eventKind}
            >
              <option value="">Выберите вид</option>
              <option value="conference">Конференция</option>
              <option value="call">Созвон</option>
              <option value="meeting">Сбор</option>
              <option value="hall_event">Мероприятие в актовом зале</option>
            </select>
          </div>
        );
      case 4:
        return (
          <div className="step" aria-labelledby="start-date-label">
            <label id="start-date-label" className="label-start-date">
              Дата начала:
            </label>
            <input
              className="input-start-date"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              onKeyPress={handleKeyPress}
              required
              aria-required="true"
              aria-invalid={!formData.startDate}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        );
      case 5:
        return (
          <div className="step" aria-labelledby="end-date-label">
            <label id="end-date-label" className="label-end-date">
              Дата окончания:
            </label>
            <input
              className="input-end-date"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              onKeyPress={handleKeyPress}
              required
              aria-required="true"
              aria-invalid={!formData.endDate}
              min={formData.startDate || new Date().toISOString().split("T")[0]}
            />
          </div>
        );
      case 6:
        return (
          <div className="step" aria-labelledby="departments-label">
            <label id="departments-label" className="label-departments">
              Отделы:
            </label>
            {loading.departments ? (
              <p>Загрузка отделов...</p>
            ) : allDepartments.length > 0 ? (
              <Select
                isMulti
                options={allDepartments.map((department) => ({
                  value: department.id_department,
                  label: department.department_name,
                }))}
                value={formData.selectedDepartments.map((id) => ({
                  value: id,
                  label: allDepartments.find((dep) => dep.id_department === id)
                    .department_name,
                }))}
                onChange={(selectedOptions) => {
                  handleInputChange(
                    "selectedDepartments",
                    selectedOptions.map((option) => option.value)
                  );
                }}
                placeholder="Выберите отделы"
                aria-label="Выберите отделы"
              />
            ) : (
              <p>Отделы не загружены</p>
            )}
          </div>
        );
      case 7:
        return (
          <div className="step" aria-labelledby="users-label">
            <label id="users-label" className="label-notified-users">
              Пользователи для уведомления:
            </label>
            {loading.users ? (
              <p>Загрузка пользователей...</p>
            ) : usersInSelectedDepartments.length > 0 ? (
              <div className="users-list">
                {usersInSelectedDepartments.map((user) => (
                  <div key={user.id_user} className="user-item">
                    <input
                      type="checkbox"
                      id={`user-${user.id_user}`}
                      checked={formData.notifiedUsers.includes(user.id_user)}
                      onChange={() => {
                        handleInputChange(
                          "notifiedUsers",
                          formData.notifiedUsers.includes(user.id_user)
                            ? formData.notifiedUsers.filter(
                                (id) => id !== user.id_user
                              )
                            : [...formData.notifiedUsers, user.id_user]
                        );
                      }}
                      aria-labelledby={`user-label-${user.id_user}`}
                    />
                    <label
                      id={`user-label-${user.id_user}`}
                      htmlFor={`user-${user.id_user}`}
                    >
                      {user.login_users} ({user.last_name} {user.first_name})
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p>
                {formData.selectedDepartments.length > 0
                  ? "В выбранных отделах нет пользователей"
                  : "Выберите отделы для отображения пользователей"}
              </p>
            )}
          </div>
        );
      case 8:
        return (
          <div className="step" aria-labelledby="description-label">
            <label id="description-label" className="label-description">
              Описание мероприятия:
            </label>
            <textarea
              placeholder="Описание мероприятия"
              className="input-description-create"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              onKeyPress={handleKeyPress}
              aria-labelledby="description-label"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        resetForm();
        onRequestClose();
      }}
      contentLabel="Создать событие"
      className="modal"
      overlayClassName="overlay"
      aria-modal="true"
      role="dialog"
    >
      <button
        className="close-button"
        onClick={() => {
          resetForm();
          onRequestClose();
        }}
        aria-label="Закрыть модальное окно"
      >
        ×
      </button>

      <h2>Создание нового события</h2>

      {!networkStatus && (
        <div className="error-message" role="alert">
          Внимание: отсутствует подключение к интернету. Некоторые функции могут
          быть недоступны.
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="step-indicator">Шаг {currentStep} из 8</div>

      {renderStep()}

      <div className="navigation-buttons">
        {currentStep > 1 && (
          <button
            className="button-back"
            onClick={handleBack}
            disabled={loading.submitting}
          >
            Назад
          </button>
        )}
        {currentStep < 8 ? (
          <button
            className="button-next"
            onClick={handleNext}
            disabled={loading.submitting}
          >
            Далее
          </button>
        ) : (
          <button
            className="button-submit"
            onClick={handleSubmit}
            disabled={loading.submitting}
          >
            {loading.submitting ? "Создание..." : "Создать"}
          </button>
        )}
      </div>
    </Modal>
  );
};

CreateEventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  onEventCreated: PropTypes.func.isRequired,
};

export default CreateEventModal;
