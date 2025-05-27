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