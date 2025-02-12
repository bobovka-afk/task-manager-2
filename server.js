const express = require('express')
const http = require('http')
const { setupWebSocket } = require('./websocket')
const authRoutes = require('./routes/auth')
const taskRoutes = require('./routes/tasks')

const app = express()
const server = http.createServer(app)
setupWebSocket(server)

const PORT = process.env.PORT || 4200

app.use(express.json())
app.use('/auth', authRoutes)
app.use('/api', taskRoutes)

app.get('/', (req, res) => {
	res.send('WebSocket сервер работает!')
})

server.listen(PORT, () => {
	console.log(`Сервер запущен на порту ${PORT}`)
})
