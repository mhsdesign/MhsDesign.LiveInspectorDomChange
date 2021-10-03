
const {readFileSync} = require('fs')
const {objectToHtmlAttributes, objectToHtmlAttributeSelector, getNormalizedHtml, dispatchCustomEvent} = require('./htmlTools')

const mockMhsDesignLiveInspectorJsEvents = ({node, properties, action}) => {
    dispatchCustomEvent('MhsDesign.LiveInspectorJsEvents', action, {
        node: node,
        properties: properties
    })
}

const setUpDocumentWithScripts = () => {
    inlineJsScripts = [
        '../../Resources/Public/ListenAndChangeDomByFunctions.js',
        '../../Resources/Public/DefaultChangeDomNodeFunctions.js'
    ]
    inlineJsScripts.map(fileName => {
        const file = readFileSync(fileName)

        const Script = document.createElement('script')
        Script.innerHTML = file
        document.head.append(Script)
    })
}

const evaluateTests = ({crNode, newProperties, changerData, originalMarkup, expectedMarkup, actionType='COMMIT', afterSetupHook=null, afterChangeHook=null}) => {

    const changerAttr = objectToHtmlAttributes(changerData)

    const filledOriginalMarkup = originalMarkup(changerAttr)
    const filledExpectedMarkup = expectedMarkup(changerAttr)

    document.body.innerHTML = filledOriginalMarkup

    // get the dom element by using the changerData: ['data-__change-contextpath': '...' ...
    const el = document.body.querySelector(objectToHtmlAttributeSelector(changerData))

    /* HOOK afterSetup */
    afterSetupHook?.(el)

    mockMhsDesignLiveInspectorJsEvents({
        node: crNode,
        properties: newProperties,
        action: actionType
    })

    /* HOOK afterChange */
    afterChangeHook?.(el)

    expect(document.body.innerHTML).toBe(getNormalizedHtml(filledExpectedMarkup))

    document.body.innerHTML = ''
}

module.exports = {
    evaluateTests,
    setUpDocumentWithScripts
}
