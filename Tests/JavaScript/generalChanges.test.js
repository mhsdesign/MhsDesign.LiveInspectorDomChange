const {evaluateTests, setUpDocumentWithScripts} = require('./tools/testsTools')

beforeAll(setUpDocumentWithScripts)

// the contextPath is for each test always changed for simplification.
// the chache feature regarding oldVal on multiple commits and no applied changes
// is not tested here.
const dataProvider = {
    'text changes (changeText)': {
        crNode: {
            contextPath: '/sites/test/main/node3245265@user;language=de_DE',
            properties: {
                text: 'Old original text'
            }
        },
        newProperties: {
            text: 'New text to display'
        },
        changerData: {
            'data-__change-contextpath': '/sites/test/main/node3245265@user;language=de_DE',
            'data-__change-prop-454754': '{"text":{"function":"changeText"}}'
        },
        originalMarkup: changer => `<div ${changer}>Old original text</div>`,
        expectedMarkup: changer => `<div ${changer}>New text to display</div>`
    },

    'text changes by eval (clientEval)': {
        crNode: {
            contextPath: '/sites/test/main/node78678979@user;language=de_DE',
            properties: {
                text: 'a'
            }
        },
        newProperties: {
            text: 'b'
        },
        changerData: {
            'data-__change-contextpath': '/sites/test/main/node78678979@user;language=de_DE',
            'data-__change-prop-867687': `{"text":{"function":"clientEval","arguments":"el.textContent = (newVal === 'a' ? 'text is a' : 'text is not a')"}}`
        },
        originalMarkup: changer => `<div ${changer}>text is a</div>`,
        expectedMarkup: changer => `<div ${changer}>text is not a</div>`
    },

    'css class changes (changeClass)': {
        crNode: {
            contextPath: '/sites/test/main/node86764563@user;language=de_DE',
            properties: {
                size: 'medium'
            }
        },
        newProperties: {
            size: 'large'
        },
        changerData: {
            'data-__change-contextpath': '/sites/test/main/node86764563@user;language=de_DE',
            'data-__change-prop-130252': '{"size":{"function":"changeClass"}}'
        },
        originalMarkup: changer => `<div ${changer} class="medium"></div>`,
        expectedMarkup: changer => `<div ${changer} class="large"></div>`
    },

    'css class changes and will not remove other classes (changeClass)': {
        crNode: {
            contextPath: '/sites/test/main/node16587468@user;language=de_DE',
            properties: {
                size: 'medium'
            }
        },
        newProperties: {
            size: 'large'
        },
        changerData: {
            'data-__change-contextpath': '/sites/test/main/node16587468@user;language=de_DE',
            'data-__change-prop-156431': '{"size":{"function":"changeClass"}}'
        },
        originalMarkup: changer => `<div ${changer} class="whatever hi lorem-ipsum medium"></div>`,
        expectedMarkup: changer => `<div ${changer} class="whatever hi lorem-ipsum large"></div>`
    },

    'background-color changes (changeStyle)': {
        crNode: {
            contextPath: '/sites/test/main/node364688@user;language=de_DE',
            properties: {
                color: 'rgb(0, 0, 0)'
            }
        },
        newProperties: {
            color: 'rgb(155, 20, 98)'
        },
        changerData: {
            'data-__change-contextpath': '/sites/test/main/node364688@user;language=de_DE',
            'data-__change-prop-867431': '{"color":{"function":"changeStyle","arguments":"backgroundColor"}}'
        },
        originalMarkup: changer => `<div ${changer} style="background-color: rgb(0, 0 , 0);"></div>`,
        expectedMarkup: changer => `<div ${changer} style="background-color: rgb(155, 20, 98);"></div>`
    },
}

describe.each(Object.keys(dataProvider))(`Only COMMITs different nodes: Test nodes`, dataKey => {
    it(`whose ${dataKey}`, () => {
        evaluateTests(dataProvider[dataKey])
    })
})
