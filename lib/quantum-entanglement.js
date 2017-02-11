/* global atom document*/
const { CompositeDisposable } = require('atom')
const alert = require('./connect-alert')()
const conflict = require('./conflict-alert')()

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
    const link = require('./connect')(this)

    document.getElementById('server-form').addEventListener('submit', function(event) {
      event.preventDefault()
      alert.hide()
      link.connect(link.instance, conflict)
    })
    alert.show()
  },
  deactivate: function() {
    this.subscriptions.dispose()
    this.modalPanel.destroy()
  }
}
