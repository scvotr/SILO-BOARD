'use strict'

const socketHandleCustomEvents = socket => {
  socket.on('message', async data => {
    console.log(`Message from ${socket.id}: ${JSON.stringify(data)}`)
    socket.emit('response', 'Server received: ' + data)
  })
  
}

module.exports = {
  socketHandleCustomEvents,
}
