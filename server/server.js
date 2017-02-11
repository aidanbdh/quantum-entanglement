const PORT = process.env.PORT || 3000

const io = require('socket.io')(PORT)

const rooms = []

io.on('connection', socket => {
  console.log('A user connected')
  socket.on('disconnect', () => {
    console.log('A user disconnected')
  })
  socket.on('join', ({ name, file }) => {
    socket.join(name)
    if(rooms.indexOf(name) === -1) {
      rooms.push(name)
      rooms.push({ host: socket.id })
      socket.emit('joined', name)
    } else {
      socket.emit('file conflict')
    }
    socket.on('continue', file => {
      socket.broadcast.to(rooms[rooms.indexOf(name)+1].host).emit('get file', socket.id)
      socket.on('send file', originalFile => {
        if(originalFile === file) {
          console.log(`A user joined ${name}`)
        } else {
          socket.emit('replace', originalFile)
          socket.emit('joined', name)
        }
      })
    })
    socket.on('leave', function() { socket.leave(name) })
  })
  socket.on('redirect', ({id, file}) => {
    socket.broadcast.to(id).emit('redirect', file)
  })
  socket.on('edit', event => {
    console.log(event)
    socket.broadcast.to(event.name).emit('insert', event)
  })
})
