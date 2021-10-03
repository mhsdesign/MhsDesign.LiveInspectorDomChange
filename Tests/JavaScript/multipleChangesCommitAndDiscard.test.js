const {evaluateTests, setUpDocumentWithScripts} = require('./tools/testsTools')

beforeAll(setUpDocumentWithScripts)

const NODE_456_CONTEXT_PATH = '/sites/test/main/node456@user;language=de_DE'
const NODE_456_CHANGER_DATA = {
    'data-__change-contextpath': NODE_456_CONTEXT_PATH,
    'data-__change-prop-136658': '{"text":{"function":"changeText"}}',
    'data-__change-prop-875685': '{"height":{"function":"changeClass"}}'
}

// you need to read this chronological.
// we will change one property of a node 'node456', then a second and then discard these changes and edit again.
const dataProvider = {
    'node456: change 1: text': {
        crNode: {
            contextPath: NODE_456_CONTEXT_PATH,
            properties: {
                text: 'Old original text',
                height: 'small'
            }
        },
        actionType: 'COMMIT',
        newProperties: {
            text: 'New text to display'
        },
        changerData: NODE_456_CHANGER_DATA,
        originalMarkup: changer => `<div ${changer} class="small">Old original text</div>`,
        expectedMarkup: changer => `<div ${changer} class="small">New text to display</div>`
    },

    'node456: change 2: class': {
        crNode: {
            contextPath: NODE_456_CONTEXT_PATH,
            properties: {
                text: 'Old original text',
                height: 'small'
            }
        },
        actionType: 'COMMIT',
        newProperties: {
            height: 'big'
        },
        changerData: NODE_456_CHANGER_DATA,
        originalMarkup: changer => `<div ${changer} class="small">New text to display</div>`,
        expectedMarkup: changer => `<div ${changer} class="big">New text to display</div>`
    },

    'node456: change 3: text/class - DISCARD': {
        crNode: {
            contextPath: NODE_456_CONTEXT_PATH,
            properties: {
                text: 'Old original text',
                height: 'small'
            }
        },
        actionType: 'DISCARD',
        newProperties: {
            text: 'Old original text',
            height: 'small'
        },
        changerData: NODE_456_CHANGER_DATA,
        originalMarkup: changer => `<div ${changer} class="big">New text to display</div>`,
        expectedMarkup: changer => `<div ${changer} class="small">Old original text</div>`
    },

    'node456: change 4: class - again': {
        crNode: {
            contextPath: NODE_456_CONTEXT_PATH,
            properties: {
                text: 'Old original text',
                height: 'small'
            }
        },
        actionType: 'COMMIT',
        newProperties: {
            height: 'medium'
        },
        changerData: NODE_456_CHANGER_DATA,
        originalMarkup: changer => `<div ${changer} class="small">Old original text</div>`,
        expectedMarkup: changer => `<div ${changer} class="medium">Old original text</div>`
    },

}

describe.each(Object.keys(dataProvider))(`multiple changes Commit and Discard: Test `, dataKey => {
    it(`${dataKey}`, () => {
        evaluateTests(dataProvider[dataKey])
    })
})

