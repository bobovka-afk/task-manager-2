const express = require('express')
const { body, validationResult } = require('express-validator')
const { Op } = require('sequelize') // Используем операторы Sequelize для гибкой фильтрации
const Task = require('../models/task')
const { authenticateToken } = require('../middleware/authMiddleware')

const router = express.Router()

// Создание задачи
router.post(
	'/tasks',
	authenticateToken,
	[
		body('title').notEmpty().withMessage('Название задачи обязательно'),
		body('description').optional(),
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { title, description } = req.body
		const userId = req.user.userId

		try {
			const task = await Task.create({ title, description, userId })
			res.status(201).json(task)
		} catch (err) {
			res.status(500).json({ error: 'Ошибка при создании задачи' })
		}
	}
)

// Получение списка задач с фильтрацией и сортировкой
router.get('/tasks', authenticateToken, async (req, res) => {
	const userId = req.user.userId
	const { status, sortBy, order = 'ASC', overdue = false } = req.query

	const whereConditions = { userId }

	// Фильтрация по статусу
	if (status) {
		whereConditions.status = status
	}

	// Фильтрация по задачам с просрочкой
	if (overdue === 'true') {
		whereConditions.dueDate = { [Op.lt]: new Date() } // Убедитесь, что у задачи есть поле `dueDate`
	}

	try {
		const tasks = await Task.findAll({
			where: whereConditions,
			order: sortBy ? [[sortBy, order]] : [],
		})

		res.json(tasks)
	} catch (err) {
		res.status(500).json({ error: 'Ошибка при получении списка задач' })
	}
})

// Обновление задачи
router.put(
	'/tasks/:id',
	authenticateToken,
	[
		body('title')
			.optional()
			.notEmpty()
			.withMessage('Название задачи не может быть пустым'),
		body('description').optional(),
		body('status')
			.optional()
			.isIn(['pending', 'completed', 'overdue'])
			.withMessage('Неверный статус задачи'),
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const taskId = req.params.id
		const { title, description, status } = req.body
		const userId = req.user.userId

		try {
			const task = await Task.findOne({ where: { id: taskId, userId } })

			if (!task) {
				return res.status(404).json({ error: 'Задача не найдена' })
			}

			task.title = title || task.title
			task.description = description || task.description
			task.status = status || task.status

			await task.save()
			res.json(task)
		} catch (err) {
			res.status(500).json({ error: 'Ошибка при обновлении задачи' })
		}
	}
)

// Удаление задачи
router.delete('/tasks/:id', authenticateToken, async (req, res) => {
	const taskId = req.params.id
	const userId = req.user.userId

	try {
		const task = await Task.findOne({ where: { id: taskId, userId } })

		if (!task) {
			return res.status(404).json({ error: 'Задача не найдена' })
		}

		await task.destroy()
		res.json({ message: 'Задача удалена' })
	} catch (err) {
		res.status(500).json({ error: 'Ошибка при удалении задачи' })
	}
})

module.exports = router
