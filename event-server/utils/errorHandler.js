module.exports = (err, req, res, next) => {
  console.error(err.stack);
  
  // Ошибки валидации
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation error',
      details: err.errors 
    });
  }
  
  // Ошибки Multer (загрузка файлов)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      error: 'File upload error',
      details: err.message 
    });
  }
  
  // Ошибки JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: 'Invalid token' 
    });
  }
  
  // Ошибки базы данных
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({ 
      error: 'Database error',
      details: err.detail 
    });
  }
  
  // Все остальные ошибки
  res.status(500).json({ 
    error: 'Internal server error' 
  });
};