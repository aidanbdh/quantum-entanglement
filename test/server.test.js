/* globals before after describe it*/

const createServer = require('../server/server')
const { expect } = require('chai')
const client = require('socket.io-client')

describe('server', () => {

  const io = require('socket.io')()

  let server
  let hostSocket
  let guestSocket

   before(done => {
     io.listen(3001)
     server = createServer(io)
     hostSocket = client.connect('http://localhost:3001')
     guestSocket = client.connect('http://localhost:3001')
     hostSocket.emit('join', 'test')
     guestSocket.emit('join', 'test')
     let connections = 0
     server.on('connection', () => {
       connections++
       if(connections === 2) done()
     })
   })

   after(() => {
     server.close()
   })

  describe('continue', () => {

    it('emits get file with a socket id', done => {
      guestSocket.emit('continue')
      hostSocket.once('get file', id => {
        expect(id).to.be.a('string')
        done()
      })
    })

  })

  describe('send file', () => {

    it('emits replace with a file string, cursor and color and emits joined with a name and color', done => {
      let isDone = false
      guestSocket.emit('continue')
      hostSocket.once('get file', id => {
        hostSocket.emit('send file', {
          id,
          file: '12345',
          cursors: []
        })
      })
      guestSocket.once('replace', ({ file, newCursors, color}) => {
        expect(file).to.have.length(5)
        expect(newCursors).to.be.an('array')
        expect(color[0]).to.be.a('string')
        if(!isDone) isDone = true
        else done()
      })
      guestSocket.once('joined', ({name, color}) => {
        expect(name).to.equal('test')
        expect(color[0]).to.be.a('string')
        if(!isDone) isDone = true
        else done()
      })
    })

  })

  describe('new socket', () => {

    it('broadcasts the new socket event and cursor data to the room', done => {
      guestSocket.emit('new socket', { color: 'blue', name: 'guest' })
      hostSocket.once('new socket', ({ color, name }) => {
        expect(color).to.equal('blue')
        expect(name).to.equal('guest')
        done()
      })
    })

  })

  describe('edit', () => {

    it('broadcasts the insert event with new text data to the room', done => {
      guestSocket.emit('edit', { name: 'test', newText: 'hi', newBufferRange: [[0, 0], [0, 1]] })
      hostSocket.once('insert', ({ newText, newBufferRange }) => {
        expect(newText).to.equal('hi')
        expect(newBufferRange).to.deep.equal([[0, 0], [0, 1]])
        done()
      })
    })

  })

  describe('cursor moved', () => {

    it('broadcasts the update cursor event with cursor info to the room', done => {
      guestSocket.emit('cursor moved', { color:'green', newBufferPosition: [0, 1] })
      hostSocket.once('update cursor', ({ color, newBufferPosition }) => {
        expect(color).to.equal('green')
        expect(newBufferPosition).to.deep.equal([0, 1])
        done()
      })
    })

  })

  describe('leave', () => {

    it('disconnects the socket and emits the disconnect event to the room', done => {
      guestSocket.emit('leave')
      hostSocket.once('disconnect', ({ color }) => {
        expect(color[0]).to.be.a('string')
        done()
      })
    })

  })

})
