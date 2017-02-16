const PORT = process.env.PORT || 3000

const io = require('socket.io')(PORT)

const rooms = []

io.on('connection', socket => {
  console.log('A user connected')
  socket.on('join', name => {
    socket.join(name)
    let roomId = rooms.indexOf(name)
    let forceDisconnect
    if(roomId === -1) {
      rooms.push(name)
      rooms.push({ host: socket.id, connections: [], colors: ['white', 'black', 'maroon', 'red', 'pink', 'brown', 'orange', 'coral', 'olive', 'yellow', 'beige', 'lime', 'green', 'mint', 'teal', 'cyan', 'navy', 'blue', 'purple', 'lavender', 'magenta', 'grey'] })
      console.log(`A user created ${name}`)
      roomId = 0
      const num = Math.floor(Math.random() * rooms[roomId + 1].colors.length)
      const color = rooms[roomId + 1].colors.slice(num, num + 1)
      socket.emit('joined', { name, color})
      rooms[roomId + 1].connections.push({id: socket.id, color})
    } else {
      socket.emit('file conflict')
    }
    socket.on('continue', () => {
      socket.to(rooms[roomId+1].host).emit('get file', socket.id)
    })
    socket.on('send file', ({ id, file, cursors }) => {
      console.log(`A user joined ${name}`)
      const num = Math.floor(Math.random() * rooms[roomId + 1].colors.length)
      const color = rooms[roomId + 1].colors.slice(num, num + 1)
      socket.to(id).emit('replace', { file, newCursors: cursors, color })
      socket.to(id).emit('joined', { name, color})
      rooms[roomId + 1].connections.push({id, color})
    })
    socket.on('new socket', (cursor) => {
      socket.broadcast.to(name).emit('new socket', cursor)
    })
    socket.on('cursor moved', info => {
      socket.broadcast.to(name).emit('update cursor', info)
    })
    socket.on('leave', function() { socket.leave(name) })
    socket.on('disconnect', () => {
      if(forceDisconnect) return;
      console.log('A user disconnected')
      const removed = rooms[roomId + 1].connections.splice(rooms[roomId + 1].connections.indexOf(socket.id), rooms[roomId + 1].connections.indexOf(socket.id) + 1)
      if(rooms[roomId + 1].connections.length === 0) {
        rooms.splice(roomId, roomId + 2)
        return
      }
      if(socket.id === rooms[roomId].host) rooms[roomId].host = rooms[roomId].connections[0].id
      console.log('disconnect')
      socket.broadcast.to(name).emit('disconnect', removed)
      forceDisconnect = true
    })
  })
  socket.on('edit', event => {
    console.log(event)
    socket.broadcast.to(event.name).emit('insert', event)
  })
})
