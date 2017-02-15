/* global atom document*/
const { CompositeDisposable } = require('atom')
const alert = require('./alert')('Enter a server name.', 'server')
const conflict = require('./confirm.js')('Merging files may override local changes. Would you like to connect?', 'conflict')

module.exports = {
  activate: function() {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'quantum-entanglement:toggle': this.toggle
    }))
    atom.workspace.addModalPanel({
       item: alert,
       visible: false
    })
    atom.workspace.addModalPanel({
       item: conflict,
       visible: false
    })
    this.toggled = false
  },
  toggle: function() {
    if(this.toggled) return
    this.toggled = true

    const alert = atom.workspace.getModalPanels()[0]
    const conflict = atom.workspace.getModalPanels()[1]
    const connect = require('./connect')(this.subscriptions, atom.workspace.getActiveTextEditor())
    const notification = require('./notification')

    document.getElementById('server-form').addEventListener('submit', function(event) {
      event.preventDefault()
      const input = document.getElementById('server-input').value
      alert.hide()
      connect(input, conflict, notification)
    })
    alert.show()
  },
  deactivate: function() {
    this.subscriptions.dispose()
    this.modalPanel.destroy()
  }
}
