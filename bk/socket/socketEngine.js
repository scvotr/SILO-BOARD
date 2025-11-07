'use strict'

const { socketHandleCustomEvents } = require('./socketHandleCustomEvents')
const { socketHandleSystemEvents } = require('./socketHandleSystemEvents')

module.exports.socketEngine = socketIO => {
  socketIO.on('connection', async socket => {
    console.log('✅ Client connected:', socket.id)
    
    // Отправляем приветственное сообщение
    socket.emit('message', 'Welcome from server!')
    
    // Обрабатываем сообщения от клиента
    socket.on('client-message', (data) => {
      console.log('📨 Message from client:', data)
      socket.emit('message', `Server received: ${data}`)
    })
    
    socketHandleSystemEvents(socket)
    socketHandleCustomEvents(socket)
    
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id)
    })
  })
}