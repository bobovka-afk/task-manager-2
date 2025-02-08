const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET_KEY;


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

      // Создание пользователя через Sequelize
      await User.create({ email, password: hashedPassword });

      res.json({ message: 'Пользователь зарегистрирован' });
    } catch (err) {
      console.error('Ошибка базы данных:', err);
      res.status(500).json({ error: 'Ошибка при сохранении данных' });
    }
  }
);

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
      // Поиск пользователя через Sequelize
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

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
    res.json({ message: 'Вы получили защищённые данные', user: req.user });
});

module.exports = router;
