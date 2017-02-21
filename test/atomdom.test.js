/*globals describe it before after*/

const { jsdom } = require('jsdom')
const { expect } = require('chai')
const alert = require('../lib/alert')
const confirm = require('../lib/confirm')

describe('Atom DOM events', () => {

  before(() => {

    const { defaultView: window } = jsdom()
    const { navigator, document } = window
    Object.assign(global, { window, document, navigator })

  })

  after(() => {

    var window
    var navigator
    var document
    Object.assign(global, { window, document, navigator })

  })

  describe('alert', () => {

    it('returns a dom element', () => {
      const element = alert('test')
      expect(element).to.have.property('tagName', 'DIV')
      const message = element.querySelector('.message')
      expect(message).to.have.property('textContent', 'test')
    })

  })

  describe('confirm', () => {

    it('returns a dom element', () => {
      const element = confirm('test')
      expect(element).to.have.property('tagName', 'DIV')
      const message = element.querySelector('.message')
      expect(message).to.have.property('textContent', 'test')
      const buttons = element.querySelectorAll('button')
      expect(buttons[0]).to.have.property('textContent', 'Yes')
      expect(buttons[1]).to.have.property('textContent', 'No')

    })

  })

})
