// utils/api.js
export const login = async (credentials) => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка авторизации');
    }
    
    return await response.json();
  };
  
  export const fetchEvents = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/events', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при загрузке событий');
    }
    
    return await response.json();
  };