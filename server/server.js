const io = require('socket.io')(3000)

console.log('Connection active')

io.on('connection', socket => {
  socket.on('disconnect', () => {
    console.log('A user disconnected')
  })
  console.log('A user connected')
  socket.on('edit', event => {
    socket.emit('insert', event)
  })
})
