const {evaluateTests, setUpDocumentWithScripts} = require('./tools/testsTools')

beforeAll(setUpDocumentWithScripts)

const NODE_123_CONTEXT_PATH = '/sites/test/main/node123@user;language=de_DE'

// you need to read this chronological.
const dataProvider = {
    'node123: first change where the Cr holds the oldVal': {
        crNode: {
            contextPath: NODE_123_CONTEXT_PATH,
            properties: {
                // the value in the Cr from the last applied changes or after page load.
                height: 'big'
            }
        },
        newProperties: {
            // the Commit event with will only be send and will not be reflected in the node.properties when not applied.
            height: 'small'
        },
        changerData: {
            'data-__change-contextpath': NODE_123_CONTEXT_PATH,
            'data-__change-prop-987654': '{"height":{"function":"changeClass"}}'
        },
        // the oldVal will hold the value big as it is in the Cr and no previous Commits happend beforehand.
        // on change class big will be removed and small added. Also the value small must be cached for the next operation.
        originalMarkup: changer => `<div ${changer} class="big"></div>`,
        expectedMarkup: changer => `<div ${changer} class="small"></div>`
    },

    'node123: new commit change without applied changes. Cr holds outdated oldVal': {
        crNode: {
            contextPath: NODE_123_CONTEXT_PATH,
            properties: {
                // outdated because changes were not saved
                height: 'big'
            }
        },
        newProperties: {
            height: 'medium'
        },
        changerData: {
            'data-__change-contextpath': NODE_123_CONTEXT_PATH,
            'data-__change-prop-987654': '{"height":{"function":"changeClass"}}'
        },
        // the original Markup will contain small, the result of the previous test.
        // height: small should be cached and be the oldVal passed to the function changeClass
        // so that the small class can be removed and medium can be added.
        originalMarkup: changer => `<div ${changer} class="small"></div>`,
        expectedMarkup: changer => `<div ${changer} class="medium"></div>`
    },

    // of coures a node will not have out of thin air a new node property and a new 'changer' and markup,
    // but the detail is added from here to simplify the first tests.
    'node123: change a second property without applied changes. Cr holds the oldVal': {
        crNode: {
            contextPath: NODE_123_CONTEXT_PATH,
            properties: {
                height: 'big',
                color: 'red'
            }
        },
        newProperties: {
            color: 'green'
        },
        changerData: {
            'data-__change-contextpath': NODE_123_CONTEXT_PATH,
            'data-__change-prop-987654': '{"height":{"function":"changeClass"}}',
            'data-__change-prop-864684': '{"color":{"function":"changeClass"}}'
        },
        originalMarkup: changer => `<div ${changer} class="medium red"></div>`,
        expectedMarkup: changer => `<div ${changer} class="medium green"></div>`
    },

    'node123: change a second property again an check if caching worked without applied changes. Cr holds outdated oldVal': {
        crNode: {
            contextPath: NODE_123_CONTEXT_PATH,
            properties: {
                height: 'big',
                color: 'red'
            }
        },
        newProperties: {
            color: 'blue'
        },
        changerData: {
            'data-__change-contextpath': NODE_123_CONTEXT_PATH,
            'data-__change-prop-987654': '{"height":{"function":"changeClass"}}',
            'data-__change-prop-864684': '{"color":{"function":"changeClass"}}'
        },
        originalMarkup: changer => `<div ${changer} class="medium green"></div>`,
        expectedMarkup: changer => `<div ${changer} class="medium blue"></div>`
    },

    'node123: change a first property again an check if caching worked without applied changes. Cr holds outdated oldVal': {
        crNode: {
            contextPath: NODE_123_CONTEXT_PATH,
            properties: {
                height: 'big',
                color: 'red'
            }
        },
        newProperties: {
            height: 'big'
        },
        changerData: {
            'data-__change-contextpath': NODE_123_CONTEXT_PATH,
            'data-__change-prop-987654': '{"height":{"function":"changeClass"}}',
            'data-__change-prop-864684': '{"color":{"function":"changeClass"}}'
        },
        originalMarkup: changer => `<div ${changer} class="medium blue"></div>`,
        expectedMarkup: changer => `<div ${changer} class="blue big"></div>`
    },
}

describe.each(Object.keys(dataProvider))(`COMMITs caches value: Test `, dataKey => {
    it(`${dataKey}`, () => {
        evaluateTests(dataProvider[dataKey])
    })
})
