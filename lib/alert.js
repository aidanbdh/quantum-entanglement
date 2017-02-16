/* globals document*/

function createAlert(text, name) {
    // Create root element
    const element = document.createElement('div')
    element.classList.add('quantum-entanglement')
    // Create message element
    const message = document.createElement('div')
    message.textContent = text
    message.classList.add('message')
    element.appendChild(message)
    const form = document.createElement('form')
    form.id = `${name}-form`
    const input = document.createElement('input')
    input.id = `${name}-input`
    const button = document.createElement('button')
    button.type = 'submit'
    button.textContent = 'Submit'
    form.appendChild(button)
    form.appendChild(input)
    element.appendChild(form)
    return element
}

module.exports = createAlert
