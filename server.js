require('dotenv').config();

const authRoutes = require('./routes/auth');
const express = require('express')
const app = express()
const PORT = process.env.PORT || 4200

app.use(express.json()); 
app.use('/', authRoutes)

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`)
})