/*
  Client:
    - Subscribes and unsubscribes to events
    - Communicate with socket
*/

const io = require('socket.io-client')
const uuidV1 = require('uuid/v1')

module.exports = function(subscriptions, text) {

  const socket = io.connect('http://localhost:3000')
  let subscription
  let roomName
  const cursors = [] //Array of objects with color, name and textEditor properties
  let myCursor

  const listen = function() {
    subscription = text.onDidChange(event => {
      socket.emit('edit', Object.assign({}, event, { id: uuidV1(), name: roomName }))
    })
    subscriptions.add(subscription)
  }

  const unlisten = function() {
    subscriptions.remove(subscription)
    subscription.dispose()
  }

  const cursor = function() {
    const moveCursor = myCursor.onDidChangePosition(event => {
      socket.emit('cursor moved', event)
    })
    subscriptions.add(moveCursor)
  }

  const onConnect = function() {
    socket.on('get file', function(id) {
      socket.emit('send file', { id, file: text.getText(), cursors})
    })
    socket.on('replace', function(file) {
      unlisten()
      text.setText(file)
      listen()
    })
    socket.on('insert', ({ oldRange, newText }) => {
      unlisten()
      text.setTextInRange(oldRange, newText)
      listen()
    })
    socket.on('update cursor', ({ newBufferPosition, Cursor }) => {
      Cursor.setScreenPosition(newBufferPosition)
    })
    listen()
  }

  const connect = function(input, alert) {
    socket.emit('join', input)
    socket.on('joined', name => { roomName = name })
    onConnect()
    socket.on('file conflict', function() {
      alert.show()
      alert.getItem().addEventListener('click', function(event) {
        if(event.target.class !== 'button') return
        if(event.target.textContent === 'No') {
          socket.emit('leave')
        } else {
          myCursor = text.getCursorAtBufferPosition(text.getCursorBufferPosition)
          socket.emit('continue')
          cursor()
        }
        alert.hide()
      })
    })
  }
  return connect
}
