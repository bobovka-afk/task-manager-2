// В файле auth.js (или где определена authenticateToken)
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET_KEY;

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Нет авторизационного токена' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Неверный или истёкший токен' });
    }

    req.user = decoded;
    next();
  });
};

// Экспортируем функцию
module.exports = { authenticateToken };
