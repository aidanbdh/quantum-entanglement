/*globals atom document*/

const io = require('socket.io-client')
const text = atom.workspace.getActiveTextEditor().getBuffer()
const uuidV1 = require('uuid/v1')

const listen = function(socket, instance ) {
  this.subscription = text.onDidChange(event => {
    socket.emit('edit', Object.assign({}, event, { id: uuidV1(), name: instance.name }))
  })
  instance.subscriptions.add(this.subscription)
}

const unlisten = function({ subscription, subscriptions }) {
  subscriptions.remove(subscription)
  this.subscription.dispose()
}

const connect = function(instance, conflict) {
  const socket = io.connect('http://localhost:3000/')
  socket.emit('join', {
    name: document.getElementById('server-input').value,
    file: text.getText()
  })
  socket.on('joined', name => { instance.name = name })
  socket.on('file conflict', function() {
    conflict.show()
    document.getElementById('conflict-form').addEventListener('click', function(event) {
      if(event.target.class !== 'button') return
      if(event.target.textContent === 'Yes') {
        socket.emit('continue', text.getText())
      } else {
        socket.emit('leave')
      }
      conflict.hide()
    })
  })
  socket.on('get file', function(id) {
    socket.emit('redirect', { id, file: text.getText()})
  })
  socket.on('redirect', function(file) {
    socket.emit('send file', file)
  })
  socket.on('replace', function(file) {
    unlisten(instance)
    text.setText(file)
    listen(socket, instance)
  })
  socket.on('insert', ({ oldRange, newText }) => {
    unlisten(instance)
    text.setTextInRange(oldRange, newText)
    listen(socket, instance)
  })
  listen(socket, instance)
}

module.exports = function(instance) {
  return {
    instance,
    connect
  }
}
