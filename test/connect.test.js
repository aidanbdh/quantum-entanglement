/* globals describe it before after */

const { expect } = require('chai')
const connect = require('../lib/connect')

//Mock objects for Atom objects
const subscriptions = {
  list: [],
  add: function(func) { this.list.push(func) }
}

const text = {
  getCursors: () => [{ onDidChangePosition: () => {}}],
  getBuffer: () => ({
    onDidChange: () => 'change'
  })
}

const connected = {
  value: false
}

const inputs = {
  input: 'test',
  username: ''
}

const alert = {
  visible: false,
  show: () => { this.visible = true },
  hide: () => { this.visible = false },
  event: {
    target: {
      class: 'button',
      textContent: 'No'
    }
  },
  getItem: function() {
    return {
      addEventListener: function(string, func) {
        func(this.event)
      }
    }
  }
}

const notification = text => text


describe('connect', () => {

  const io = require('socket.io')

  let server
  let hostConnect
  let hostSocket
  let guestConnect
  let guestSocket

  before(done => {
    server = io.listen(3002)
    server.on('connection', socket => {
      if(!hostSocket) hostSocket = socket
      else {
        guestSocket = socket
        done()
      }
    })
    hostConnect = connect(subscriptions, text, connected, 'http://localhost:3002')
    guestConnect = connect(subscriptions, text, connected, 'http://localhost:3002')
  })

  after(() => {
    server.close()
  })

  describe('socket.io events', () => {

    describe('join', () => {

      it('emits the join event with the name of a server', done => {
        hostConnect(inputs, alert, notification)
        hostSocket.once('join', name => {
          expect(name).to.equal('test')
          done()
        })
      })

    })

    describe('joined', () => {

      it('sets connected.value = true and adds color to myCursor and updates cursor array', done => {
        hostSocket.emit('joined', { name: 'test', color: 'beige' })
        setTimeout(() => {
          expect(connected.value).to.equal(true)
          done()
        }, 100)
      })

    })

    describe('file conflict', () => {

      it('')

    })

  })

  describe('Atom DOM events', () => {

    it('tests', () => {

    })

  })

})
