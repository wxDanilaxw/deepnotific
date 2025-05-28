import axios from "axios";

const API_URL = 'http://localhost:3000/api';


const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Request failed');
  }
  return response.json();
};

export const fetchEvents = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/event-categories`);
  return handleResponse(response);
};

export const fetchDepartments = async () => {
  const response = await fetch(`${API_URL}/departments`);
  return handleResponse(response);
};

export const createEvent = async (eventData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(eventData)
  });
  return handleResponse(response);
};


export const updateEvent = async (id, eventData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(eventData)
  });
  return handleResponse(response);
};

export const deleteEvent = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);


};

export const getEventsByDepartment = async (departmentId) => {
    try {
      const response = await axios.get(`/api/events/department/${departmentId}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка при загрузке событий');
    }
  };


  
  export const markEventAsRead = async (userId, eventId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events/mark-read/${userId}/${eventId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark as read');
    }
    return response.json();
  };