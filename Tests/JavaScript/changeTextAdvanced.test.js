const {evaluateTests, setUpDocumentWithScripts} = require('./tools/testsTools')

beforeAll(setUpDocumentWithScripts)

// tests regarding specific behaviours of changeText
const dataProvider = {
    'text is newly created and doesnt remove html elements': {
        crNode: {
            contextPath: '/sites/test/main/node855172@user;language=de_DE',
            properties: {
                text: ''
            }
        },
        newProperties: {
            text: 'New text to display'
        },
        changerData: {
            'data-__change-contextpath': '/sites/test/main/node855172@user;language=de_DE',
            'data-__change-prop-135784': '{"text":{"function":"changeText"}}'
        },
        originalMarkup: changer => `<h1 ${changer}><span>textContent would remove me</span></h1>`,
        expectedMarkup: changer => `<h1 ${changer}><span>textContent would remove me</span>New text to display</h1>`
    },

    'text changes textNodeId when the matching text node exists': {
        crNode: {
            contextPath: '/sites/test/main/node3245265@user;language=de_DE',
            properties: {
                text: 'I will be replaced'
            }
        },
        newProperties: {
            text: 'New text to display'
        },
        changerData: {
            'data-__change-contextpath': '/sites/test/main/node3245265@user;language=de_DE',
            'data-__change-prop-454754': '{"text":{"function":"changeText","arguments":{"textNodeId":2}}}'
        },
        originalMarkup: changer => `<div ${changer}>a<hr/>b<hr/>I will be replaced</div>`,
        expectedMarkup: changer => `<div ${changer}>a<hr/>b<hr/>New text to display</div>`
    },

    'text changes and creates empty text nodes until textNodeId': {
        crNode: {
            contextPath: '/sites/test/main/node3245265@user;language=de_DE',
            properties: {
                text: ''
            }
        },
        newProperties: {
            text: 'New text to display'
        },
        changerData: {
            'data-__change-contextpath': '/sites/test/main/node3245265@user;language=de_DE',
            'data-__change-prop-786468': '{"text":{"function":"changeText","arguments":{"textNodeId":2}}}'
        },
        originalMarkup: changer => `<div ${changer}></div>`,
        expectedMarkup: changer => `<div ${changer}>New text to display</div>`,
        afterSetupHook: el => expect(el.childNodes.length).toBe(0),
        afterChangeHook: el => expect(el.childNodes.length).toBe(3)
    }
}

describe.each(Object.keys(dataProvider))(`One Session only COMMITs focus on text: Test nodes`, dataKey => {
    it(`whose ${dataKey} (changeText)`, () => {
        evaluateTests(dataProvider[dataKey])
    })
})
