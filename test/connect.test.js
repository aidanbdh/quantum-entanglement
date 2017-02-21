/* globals describe it before after */

const { expect } = require('chai')
const connect = require('../lib/connect')

//Mock objects for Atom objects
const subscriptions = {
  list: [],
  add: function(func) { this.list.push(func) },
  remove: function(element) { this.list.splice(this.list.indexOf(element), this.list.indexOf(element) + 1) }
}

const text = {
  getCursors: () => [{ onDidChangePosition: () => {}}],
  textRange: [],
  getBuffer: () => ({
    onDidChange: () => ({ dispose: () => 'gone'}),
    setTextInRange: function(oldRange, newText) { text.textRange = [oldRange, newText] },
    getText: () => 'text'
  }),
  setText: (text) => text,
  markBufferPosition: (arr) => arr,
  decoration: [],
  decorateMarker: function(deco1,deco2) { this.decoration = [deco1, deco2] }
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
      textContent: 'Yes'
    }
  },
  getItem: function() {
    return {
      event: this.event,
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
    guestSocket.disconnect()
    hostSocket.disconnect()
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

      it('emits the continue event if yes is selected', done => {
        guestConnect(inputs, alert, notification)
        guestSocket.emit('file conflict')
        guestSocket.once('continue', () => {
          expect(alert.visible).to.equal(false)
          done()
        })

      })

    })

    describe('get file', () => {

      it('gets the text of the current buffer and array of cursors from the host', done => {
        guestSocket.to(hostSocket.id).emit('get file', guestSocket.id)
        hostSocket.once('send file', ({ id, file, cursors }) => {
          expect(id).to.equal(guestSocket.id)
          expect(file).to.equal('text')
          expect(cursors).to.be.an('array')
          done()
        })
      })

    })

    describe('replace', () => {

      it('replaces the text in the guest file', done => {
        guestSocket.emit('replace', { file: 'file', newCursors: [{color: 'blue'}], color: 'red' })
        guestSocket.once('new socket', ({ color, name }) => {
          expect(color).to.equal('red')
          expect(name).to.equal('')
          done()
        })
      })

    })

    describe('new socket', () => {

      it('sets the text decoration of a marker and adds the cursor to the cursors array', done => {
        hostSocket.emit('new socket', { color: 'white', name: 'test' })
        setTimeout(function() {
          expect(text.decoration).to.deep.equal([[0, 0], { type: 'line', class: 'white' }])
          done()
        }, 100)

      })

    })

    describe('edit', () => {

      it('sets the text in a range', done => {
        guestSocket.emit('insert', { oldRange: [1, 1], newText: 'text' })
        setTimeout(() => {
          expect(text.textRange).to.deep.equal([[1, 1], 'text'])
          done()
        }, 100)
      })

    })

    describe('cursor moved', () => {

      it('', done => {
        done()
      })

    })

    describe('leave', () => {

      it('', done => {
        done()
      })

    })

    describe('disconnect', () => {

      it('', done => {
        done()
      })

    })

  })

})
