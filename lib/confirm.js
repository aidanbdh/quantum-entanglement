/* globals document*/

function createConfirmAlert(text, name) {
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
    const yes = document.createElement('button')
    yes.class = 'button'
    yes.textContent = 'Yes'
    const no = document.createElement('button')
    no.class = 'button'
    no.textContent = 'No'
    form.appendChild(yes)
    form.appendChild(no)
    element.appendChild(form)
    return element
}

module.exports = createConfirmAlert
