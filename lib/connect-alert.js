/* globals document*/

function createElement() {
    // Create root element
    const element = document.createElement('div')
    element.classList.add('quantum-entanglement')
    // Create message element
    const message = document.createElement('div')
    message.textContent = 'Enter a server name'
    message.classList.add('message')
    element.appendChild(message)
    const form = document.createElement('form')
    form.id = 'server-form'
    const input = document.createElement('input')
    input.id = 'server-input'
    const button = document.createElement('button')
    button.type = 'submit'
    button.textContent = 'Submit'
    form.appendChild(button)
    form.appendChild(input)
    element.appendChild(form)
    return element
}

module.exports = createElement
