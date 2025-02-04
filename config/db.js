const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function testConnection() {
  try {
    const [rows, fields] = await connection.execute('SELECT 1');
    console.log('✅ Подключение успешно установлено');
  } catch (err) {
    console.error('Ошибка подключения к MySQL:', err.stack);
    process.exit(1);
  }
}

testConnection();

module.exports = connection;
