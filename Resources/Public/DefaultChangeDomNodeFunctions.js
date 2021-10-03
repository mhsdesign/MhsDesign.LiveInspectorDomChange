liveChangeFunctions.changeClass = ({el, newVal, oldVal}) => {
    oldVal && el.classList.remove(oldVal)
    newVal && el.classList.add(newVal)
}

liveChangeFunctions.changeStyle = ({el, newVal, arguments}) => {
    if (typeof arguments === 'string') {
        el.style[arguments] = newVal
    } else {
        console.warn(`No argument was specified to determine the style setting to change`)
    }
}

// would be easier and work too okayish:
// but any other dom element inside would be erased.
// this test will fail: text is newly created and doesnt remove html elements
// liveChangeFunctions.changeText = ({el, newVal}) => {
//     el.textContent = newVal
// }

liveChangeFunctions.changeText = ({el, newVal, arguments: {textNodeId = 0}}) => {
    const allDirectTextNodes = [...el.childNodes].filter(node => {
        return node.nodeType === 3
    })

    const textNode = allDirectTextNodes[textNodeId]

    if (textNode) {
        textNode.textContent = newVal
    } else {

        for (let i =0; i < textNodeId; i++) {
            const emptyTextNode = document.createTextNode('')
            el.appendChild(emptyTextNode)
        }

        const newTextNode = document.createTextNode(newVal)
        el.appendChild(newTextNode)
    }
}

liveChangeFunctions.clientEval = ({el, propName, newVal, oldVal, arguments}) => {
    if (typeof arguments === 'string') {
        eval(arguments)
    } else {
        console.warn(`liveChangeFunctions.eval needs to have a string as argument. Type: ${typeof arguments} given.`)
    }
}
