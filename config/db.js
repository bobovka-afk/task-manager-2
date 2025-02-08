const { Sequelize } = require('sequelize');
require('dotenv').config();


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: false,
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных установлено');
  } catch (err) {
    console.error('Ошибка подключения к MySQL:', err);
    process.exit(1);
  }
}

testConnection();

module.exports = sequelize;
