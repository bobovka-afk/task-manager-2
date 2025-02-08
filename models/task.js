const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Task = sequelize.define(
	'Task',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		userId: {
			type: DataTypes.INTEGER,
			references: {
				model: 'users',
				key: 'id',
			},
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: 'pending',
			allowNull: false,
		},
	},
	{
		tableName: 'tasks',
		timestamps: true,
	}
)

module.exports = Task
