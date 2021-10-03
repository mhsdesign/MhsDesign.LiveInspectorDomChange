
const escapeSingleQuotes = text => {
    return text.replace(/'/g, "&#39;");
}

const objectToHtmlAttributes = obj => {
    return Object.entries(obj).map(([key, value]) => {
        const escapedQuotes = escapeSingleQuotes(value)
        return `${key}='${escapedQuotes}'`
    }).join(' ')
}

const objectToHtmlAttributeSelector = obj => {
    return Object.entries(obj).map(([key, value]) => {
        const htmlAttribute = objectToHtmlAttributes({[key]:value})
        return `[${htmlAttribute}]`
    }).join('')
}

const getNormalizedHtml = htmlText => {
    const div = document.createElement('div')
    div.innerHTML = htmlText
    const normalizedHtml = div.innerHTML
    if (normalizedHtml === '' && htmlText.trim() !== '') {
        console.warn(`The Html normalization of:`, htmlText, `resulted in an empty string. Probably due to invalid Html`)
    }
    return normalizedHtml
}

const dispatchCustomEvent = (eventName, eventDescription, eventDetail) => {
    const detail = {
        message: eventDescription,
        ...eventDetail
    };
    const event = new CustomEvent(
        eventName, {
            detail,
            bubbles: true,
            cancelable: true
        }
    );
    document.dispatchEvent(event);
};

module.exports = {
    objectToHtmlAttributes,
    objectToHtmlAttributeSelector,
    getNormalizedHtml,
    dispatchCustomEvent
}
