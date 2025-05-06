import React, { useState } from "react";
import Modal from "react-modal";
import { Button, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import "./CreateEventModal.css";

Modal.setAppElement("#root");

const CreateEventModal = ({ isOpen, onClose, onSuccess, departments = [] }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "",
    event_kind: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    departments: [],
    status: true,
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(
      (file) => file.size <= 15 * 1024 * 1024
    );

    if (selectedFiles.length !== validFiles.length) {
      setError("Некоторые файлы превышают максимальный размер 15MB");
    } else {
      setError("");
    }

    setFiles(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Валидация
      if (
        !formData.title ||
        !formData.event_type ||
        !formData.event_kind ||
        !formData.start_date ||
        !formData.end_date
      ) {
        throw new Error("Заполните все обязательные поля");
      }

      const formDataToSend = new FormData();

      // Добавляем текстовые данные
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== null) {
          formDataToSend.append(
            key,
            key === "departments" ? JSON.stringify(value) : value
          );
        }
      });

      // Добавляем файлы
      files.forEach((file) => {
        formDataToSend.append("files", file);
      });

      // Отправка данных
      const response = await axios.post(
        "http://localhost:3000/events",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 10000, // 10 секунд таймаут
        }
      );

      if (response.status === 201) {
        onSuccess();
        onClose();
        // Сброс формы
        setFormData({
          title: "",
          description: "",
          event_type: "",
          event_kind: "",
          start_date: "",
          end_date: "",
          start_time: "",
          end_time: "",
          departments: [],
          status: true,
        });
        setFiles([]);
      }
    } catch (err) {
      console.error("Ошибка создания события:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Произошла ошибка при создании события"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="custom-modal"
      overlayClassName="modal-overlay"
      contentLabel="Создание события"
      closeTimeoutMS={300}
    >
      <div className="modal-header">
        <h3 className="modal-title">Создание нового события</h3>
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
      </div>

      <div className="modal-body">
        {error && (
          <Alert variant="danger" className="error-alert">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3 form-group">
            <Form.Label className="form-label">Название *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Введите название события"
            />
          </Form.Group>

          <Form.Group className="mb-3 form-group">
            <Form.Label className="form-label">Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              placeholder="Добавьте описание события"
            />
          </Form.Group>

          <div className="row mb-3">
            <Form.Group className="col-md-6 form-group">
              <Form.Label className="form-label">Тип события *</Form.Label>
              <Form.Select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Выберите тип</option>
                <option value="meeting">Совещание</option>
                <option value="training">Обучение</option>
                <option value="event">Мероприятие</option>
                <option value="other">Другое</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="col-md-6 form-group">
              <Form.Label className="form-label">Вид события *</Form.Label>
              <Form.Select
                name="event_kind"
                value={formData.event_kind}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Выберите вид</option>
                <option value="internal">Внутреннее</option>
                <option value="external">Внешнее</option>
              </Form.Select>
            </Form.Group>
          </div>

          <div className="row mb-3">
            <Form.Group className="col-md-6 form-group">
              <Form.Label className="form-label">Начало периода *</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="form-control"
              />
            </Form.Group>

            <Form.Group className="col-md-6 form-group">
              <Form.Label className="form-label">Конец периода *</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="form-control"
              />
            </Form.Group>
          </div>

          <div className="row mb-3">
            <Form.Group className="col-md-6 form-group">
              <Form.Label className="form-label">Время начала</Form.Label>
              <Form.Control
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="form-control"
              />
            </Form.Group>

            <Form.Group className="col-md-6 form-group">
              <Form.Label className="form-label">Время окончания</Form.Label>
              <Form.Control
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="form-control"
              />
            </Form.Group>
          </div>

          <Form.Group className="mb-3 form-group">
            <Form.Label className="form-label">Отделы</Form.Label>
            <Form.Select
              multiple
              name="departments"
              value={formData.departments}
              onChange={(e) => {
                const options = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setFormData((prev) => ({ ...prev, departments: options }));
              }}
              className="form-select departments-select"
              size="3"
            >
              {departments.map((dept) => (
                <option key={dept.id_department} value={dept.id_department}>
                  {dept.department_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3 form-group">
            <Form.Label className="form-label">
              Прикрепленные файлы (до 15MB каждый)
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={handleFileChange}
              className="file-input"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {files.length > 0 && (
              <div className="file-list mt-2">
                <strong>Выбранные файлы:</strong>
                <ul className="file-list-items">
                  {files.map((file, index) => (
                    <li key={index} className="file-item">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3 form-group status-group">
            <Form.Check
              type="switch"
              id="status-switch"
              label="Активное событие"
              checked={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.checked }))
              }
              className="status-switch"
            />
          </Form.Group>

          <div className="form-actions">
            <Button
              variant="secondary"
              onClick={onClose}
              className="cancel-btn"
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Создание...
                </>
              ) : (
                "Создать"
              )}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateEventModal;
