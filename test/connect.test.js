/* globals describe it before after */

const connect = require('../lib/connect')

connect('subscriptions', 'text', 'connected', 'http://localhost:3001')

describe('connect', () => {

  before(done => {
    done()
  })

  after(() => {

  })

  describe('socket.io events', () => {

    it('tests', done => {
      done()
    })

  })

  describe('Atom DOM events', () => {

    it('tests', () => {

    })

  })

})
