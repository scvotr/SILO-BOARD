'use strict'

const socketHandleSystemEvents = socket => {
  console.log('New connection:', socket.id)

  socket.on('disconnect', async reason => {
    console.log(`Client ${socket.id} disconnected. Reason: ${reason}`)
  })
  socket.on('error', async err => {
    console.log(`Socket error (${socket.id}): ${err.message}`)
  })
}

module.exports = {
  socketHandleSystemEvents,
}
