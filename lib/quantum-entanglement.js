/* global atom */

const io = require('socket.io-client')
const uuidV1 = require('uuid/v1')

const { CompositeDisposable } = require('atom')

module.exports = {
  activate: function() {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-plugin-test-aidan:toggle': this.toggle
    }))
  },
  toggle: function() {
    const text = atom.workspace.getActiveTextEditor().getBuffer()
    const socket = io.connect('http://localhost:3000')
    const listen = () => {
      if(this.subscription) if(this.subscription.disposalAction) return
      this.subscription = text.onDidChange(event => {
        this.lastInstance = uuidV1()
        socket.emit('edit', Object.assign({}, event, { id: this.lastInstance }))
      })
      this.subscriptions.add(this.subscription)
    }
    const unlisten = () => {
      this.subscriptions.remove(this.subscription)
      this.subscription.dispose()
    }
    socket.on('insert', event => {
      if(this.lastInstance === event.id) return
      unlisten()
      text.setTextInRange(event.oldRange, event.newText)
      listen()
    })
    listen()
  },
  deactivate: function() {
    this.subscriptions.dispose()
  }
}
