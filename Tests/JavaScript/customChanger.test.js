const {evaluateTests, setUpDocumentWithScripts} = require('./tools/testsTools')

beforeAll(() => {
    setUpDocumentWithScripts()
    const script = document.createElement('script')
    script.innerHTML = `

        liveChangeFunctions.changeCustomTest = ({el, propName, newVal, oldVal, arguments}) => {
            data = {el, propName, newVal, oldVal, arguments}
            el.textContent = JSON.stringify(data)
        }

    `
    document.head.append(script)
})

const dataProvider = {
    'text changes (customChanger)': {
        crNode: {
            contextPath: '/sites/test/main/node498679@user;language=de_DE',
            properties: {
                text: 'Old original text'
            }
        },
        newProperties: {
            text: 'New text to display'
        },
        changerData: {
            'data-__change-contextpath': '/sites/test/main/node498679@user;language=de_DE',
            'data-__change-prop-454754': '{"text":{"function":"changeCustomTest"}}'
        },
        originalMarkup: changer => `<div ${changer}>Content rendered from server</div>`,
        expectedMarkup: changer => `<div ${changer}>{\"el\":{},\"propName\":\"text\",\"newVal\":\"New text to display\",\"oldVal\":\"Old original text\",\"arguments\":[]}</div>`
    },
}

describe.each(Object.keys(dataProvider))(`Only COMMITs custom changer: Test nodes`, dataKey => {
    it(`whose ${dataKey}`, () => {
        evaluateTests(dataProvider[dataKey])
    })
})
