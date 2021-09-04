liveChangeFunctions.changeClass = ({el, newVal, oldVal}) => {
    oldVal && el.classList.remove(oldVal)
    newVal && el.classList.add(newVal)
}

liveChangeFunctions.changeStyle = ({el, newVal, arguments}) => {
    if (typeof arguments === "string") {
        el.style[arguments] = newVal
    } else {
        console.warn(`No argument was specified to determine the style setting to change`)
    }
}

liveChangeFunctions.changeText = ({el, newVal, arguments: {textNodeId = 0}}) => {
    // would be easier and work too okayish:
    // el.innerText = newVal

    // the following construct seemed more stable - with innerText the 'neos no live editing overlay' could get removed
    const allDirectTextNodes = [...el.childNodes].filter(node => {
        return node.nodeType === 3
    })

    const textNode = allDirectTextNodes[textNodeId]

    if (textNode) {
        textNode.textContent = newVal
    } else {
        const newTextNode = document.createTextNode(newVal)
        el.appendChild(newTextNode)
    }
}
