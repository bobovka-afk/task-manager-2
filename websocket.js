const WebSocket = require('ws')

function setupWebSocket(server) {
	const wss = new WebSocket.Server({ server })

	wss.on('connection', ws => {
		console.log('Новое WebSocket-соединение')

		ws.on('message', message => {
			console.log(`Получено сообщение: ${message}`)
			ws.send(`Сервер получил: ${message}`)
		})

		ws.on('close', () => {
			console.log('Клиент отключился')
		})
	})

	console.log('WebSocket сервер готов к подключению')
}

module.exports = { setupWebSocket }
