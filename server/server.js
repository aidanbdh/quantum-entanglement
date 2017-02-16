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
      rooms.push({ host: socket.id, colors: ['white', 'black', 'maroon', 'red', 'pink', 'brown', 'orange', 'coral', 'olive', 'yellow', 'beige', 'lime', 'green', 'mint', 'teal', 'cyan', 'navy', 'blue', 'purple', 'lavender', 'magenta', 'grey'] })
      console.log(`A user created ${name}`)
      const num = Math.floor(Math.random() * rooms[rooms.indexOf(name) + 1].colors.length)
      const color = rooms[rooms.indexOf(name) + 1].colors.slice(num, num + 1)
      socket.emit('joined', { name, color})
    } else {
      socket.emit('file conflict')
    }
    socket.on('continue', () => {
      socket.to(rooms[rooms.indexOf(name)+1].host).emit('get file', socket.id)
    })
    socket.on('send file', ({ id, file, cursors }) => {
      console.log(`A user joined ${name}`)
      const num = Math.floor(Math.random() * rooms[rooms.indexOf(name) + 1].colors.length)
      const color = rooms[rooms.indexOf(name) + 1].colors.slice(num, num + 1)
      socket.to(id).emit('replace', { file, newCursors: cursors, color })
      socket.to(id).emit('joined', { name, color})
    })
    socket.on('new socket', (cursor) => {
      socket.broadcast.to(name).emit('new socket', cursor)
    })
    socket.on('cursor moved', info => {
      socket.broadcast.to(name).emit('update cursor', info)
    })
    socket.on('leave', function() { socket.leave(name) })
  })
  socket.on('edit', event => {
    console.log(event)
    socket.broadcast.to(event.name).emit('insert', event)
  })
})
