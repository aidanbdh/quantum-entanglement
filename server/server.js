const PORT = process.env.PORT || 3000

const io = require('socket.io')(PORT)

const rooms = []

io.on('connection', socket => {
  console.log('A user connected')
  socket.on('disconnect', () => {
    console.log('A user disconnected')
  })
  socket.on('join', name => {
    socket.join(name)
    if(rooms.indexOf(name) === -1) {
      rooms.push(name)
      rooms.push({ host: socket.id })
      console.log(`A user created ${name}`)
      socket.emit('joined', name)
    } else {
      socket.emit('file conflict')
    }
    socket.on('continue', () => {
      socket.broadcast.to(rooms[rooms.indexOf(name)+1].host).emit('get file', socket.id)
    })
    socket.on('send file', ({ id, file }) => {
      console.log(`A user joined ${name}`)
      socket.broadcast.to(id).emit('replace', file)
      socket.broadcast.to(id).emit('joined', name)
    })
    socket.on('leave', function() { socket.leave(name) })
  })
  socket.on('edit', event => {
    console.log(event)
    socket.broadcast.to(event.name).emit('insert', event)
  })
})
