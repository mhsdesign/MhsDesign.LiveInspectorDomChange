
function mimicLiveInspectorDomChange(property, newValue, nodeType) {
    const dispatchCustomEvent = (eventName, eventDescription, eventDetail = {}) => {
        const detail = {
            message: eventDescription,
            ...eventDetail
        };
        const event = new CustomEvent(
            eventName,
            {
                detail,
                bubbles: true,
                cancelable: true
            }
        );
        document.dispatchEvent(event);
    };

    const nestedObjectSelect = (searchedObject, forKey, withValue) => {
        if (searchedObject.hasOwnProperty(forKey) && searchedObject[forKey] === withValue)
            return searchedObject

        for (const nestedValue of Object.values(searchedObject)) {
            // typeof null === "object"
            if (nestedValue !== null && typeof nestedValue === "object") {
                try {
                    return nestedObjectSelect(nestedValue, forKey, withValue)
                } catch {}
            }
        }
        throw `no key '${forKey}' with value '${withValue}' found in ${JSON.stringify(searchedObject)}`
    }

    let firstMatchingNode
    try {
        firstMatchingNode = nestedObjectSelect(window["@Neos.Neos.Ui:Nodes"], 'nodeType', nodeType)
    } catch {
        console.error(`No node nodeType: "${nodeType}" found in window["@Neos.Neos.Ui:Nodes"]`, window["@Neos.Neos.Ui:Nodes"])
        return
    }

    const properties = {}
    properties[property] = newValue

    // simulate user COMMIT event
    dispatchCustomEvent('MhsDesign.LiveInspectorJsEvents', 'COMMIT', {
        node: firstMatchingNode,
        properties: properties
    })
}
