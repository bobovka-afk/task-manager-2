const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware')

const SECRET_KEY = process.env.JWT_SECRET_KEY 

// Регистрация
router.post('/register', 
  [
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [result] = await db.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

      res.json({ message: 'Пользователь зарегистрирован' });
    } catch (err) {
      console.error('Ошибка базы данных:', err);
      res.status(500).json({ error: 'Ошибка при сохранении данных' });
    }
  }
);

// Логин и генерация токена
router.post('/login', 
  [
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').notEmpty().withMessage('Пароль обязателен'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const [results] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (results.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const storedHashedPassword = results[0].password;
      const isPasswordValid = await bcrypt.compare(password, storedHashedPassword);

      if (isPasswordValid) {
        // Генерация JWT
        const token = jwt.sign({ userId: results[0].id, email: results[0].email }, SECRET_KEY, { expiresIn: '1h' });

        return res.json({ message: 'Авторизация успешна!', token });
      } else {
        return res.status(401).json({ error: 'Неверный пароль' });
      }
    } catch (err) {
      console.error('Ошибка при авторизации:', err);
      res.status(500).json({ error: 'Ошибка при авторизации' });
    }
  }
);

router.get('/protected', authenticateToken, (req, res) => {
    // Получаем данные пользователя из токена
    const user = req.user;
    
    res.json({ message: 'Вы получили защищённые данные', user });
  });
  

module.exports = router;
