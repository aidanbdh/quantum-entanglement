/*
  Client:
    - Subscribes and unsubscribes to events
    - Communicate with socket
*/

const io = require('socket.io-client')
const uuidV1 = require('uuid/v1')

module.exports = function(subscriptions, text) {

  const socket = io.connect('https://quantum-entanglement.herokuapp.com/')
  let subscription
  let roomName
  const cursors = [] //Array of objects with color, name and cursor properties
  let myCursor

  const listen = function() {
    subscription = text.getBuffer().onDidChange(event => {
      socket.emit('edit', Object.assign({}, event, { id: uuidV1(), name: roomName }))
    })
    subscriptions.add(subscription)
  }

  const unlisten = function() {
    subscriptions.remove(subscription)
    subscription.dispose()
  }

  const cursor = function() {
    const moveCursor = myCursor.cursor.onDidChangePosition(event => {
      socket.emit('cursor moved', { newBufferPosition: event.newBufferPosition, id: cursors.indexOf(myCursor)})
    })
    subscriptions.add(moveCursor)
  }

  const onConnect = function(notification) {
    socket.on('get file', function(id) {
      socket.emit('send file', {
        id,
        file: text.getBuffer().getText(),
        cursors: cursors.map(({ name, color }) => ({ name, color }))
      })
    })
    socket.on('replace', function({ file, newCursors, color }) {
      unlisten()
      text.setText(file)
      myCursor.color = color
      newCursors.forEach(({ color, name }) => {
        const cursor = text.markBufferPosition([ 0, 0 ])
        cursors.push({ color, name, cursor })
        text.decorateMarker(cursor, { type: 'line', class: color })
      })
      socket.emit('new socket', { color: myCursor.color, name: myCursor.name })
      listen()
    })
    socket.on('new socket', ({ color, name }) => {
      const cursor = text.markBufferPosition([ 0, 0 ])
      cursors.push({ color, name, cursor })
      text.decorateMarker(cursor, { type: 'line', class: color })
      notification(`${name} has connected.`)
    })
    socket.on('insert', ({ oldRange, newText }) => {
      unlisten()
      text.getBuffer().setTextInRange(oldRange, newText)
      listen()
    })
    socket.on('update cursor', ({ newBufferPosition, id }) => {
      if(id === -1) return
      cursors[id].cursor.setHeadBufferPosition(newBufferPosition)
      cursors[id].cursor.clearTail()
    })
    listen()
  }

  const connect = function({ input, username }, alert, notification) {
    socket.emit('join', input)
    socket.on('joined', ({ name, color }) => {
      roomName = name
      myCursor.color = color
      cursors.push(myCursor)
    })
    myCursor = { color: null, name: username, cursor:text.getCursors()[0] }
    cursor()
    onConnect(notification)
    socket.on('file conflict', function() {
      alert.show()
      alert.getItem().addEventListener('click', function(event) {
        if(event.target.class !== 'button') return
        if(event.target.textContent === 'No') {
          socket.emit('leave')
        } else {
          socket.emit('continue')
        }
        alert.hide()
      })
    })
  }
  return connect
}
