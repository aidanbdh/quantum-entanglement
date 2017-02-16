const PORT = process.env.PORT || 3000

const io = require('socket.io')(PORT)

const rooms = []

io.on('connection', socket => {
  console.log('A user connected')
  socket.on('join', name => {
    socket.join(name)
    let roomId = rooms.indexOf(name)
    let forceDisconnect = false
    if(roomId === -1) {
      rooms.push(name)
      rooms.push({ host: socket.id, connections: [], colors: ['white', 'maroon', 'red', 'pink', 'brown', 'orange', 'coral', 'olive', 'yellow', 'beige', 'lime', 'green', 'mint', 'teal', 'cyan', 'navy', 'blue', 'purple', 'lavender', 'magenta'] })
      console.log(`A user created ${name}`)
      roomId = 0
      const num = Math.floor(Math.random() * rooms[roomId + 1].colors.length)
      const color = rooms[roomId + 1].colors.slice(num, num + 1)
      socket.emit('joined', { name, color})
      rooms[roomId + 1].connections.push({id: socket.id, color})
      socket.on('disconnect', () => {
        if(!forceDisconnect) {
          forceDisconnect = true
          console.log(`The host has disconnected from ${name}. A new host has been assigned.`)
          let removedId
          rooms[roomId + 1].connections.forEach((value, index) => { if(value.id === socket.id) removedId = index})
          const removed = rooms[roomId + 1].connections.splice(removedId, removedId + 1)
          if(rooms[roomId + 1].connections.length === 0) return rooms.splice(roomId, roomId + 2)
          rooms[roomId + 1].host = rooms[roomId + 1].connections[0].id
          io.to(name).emit('disconnect', removed[0])
        }
      })
    } else {
      socket.emit('file conflict')
    }
    socket.on('continue', () => {
      socket.to(rooms[roomId+1].host).emit('get file', socket.id)
      socket.on('disconnect', () => {
        if(!forceDisconnect) {
          forceDisconnect = true
          console.log(`A user has disconnected from ${name}`)
          let removedId
          rooms[roomId + 1].connections.forEach((value, index) => { if(value.id === socket.id) removedId = index})
          const removed = rooms[roomId + 1].connections.splice(removedId, removedId + 1)
          if(rooms[roomId + 1].connections.length === 0) return rooms.splice(roomId, roomId + 2)
          io.to(name).emit('disconnect', removed[0])
        }
      })
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
    socket.on('leave', function() {
      socket.leave(name)
      socket.disconnect()
    })
  })
  socket.on('edit', event => {
    console.log(event)
    socket.broadcast.to(event.name).emit('insert', event)
  })
})
