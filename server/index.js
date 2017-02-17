const server = require('./server.js')

const PORT = process.env.PORT || 3000

const io = require('socket.io')(PORT)

server(io)
