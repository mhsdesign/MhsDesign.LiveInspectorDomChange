// global hook in point
if (typeof liveChangeFunctions === 'undefined')
    var liveChangeFunctions = {}

reactToLiveInspectorChanges = () => {
    const COMMIT = 'COMMIT'
    const DISCARD = 'DISCARD'

    // cache for the COMMIT action
    // so that when changing fx. the css class the changeClass function can remove the old css class.
    class SingleCrNodeValueCache {
        #nodeContextPath = ''
        #nodeProperties = {}

        crNodeIsCached = contextPath => this.#nodeContextPath === contextPath
        getCachedProperty = propName => this.#nodeProperties[propName]
        clearCacheOfProp = propName => delete this.#nodeProperties[propName]
        propIsCached = propName => typeof this.getCachedProperty(propName) !== "undefined"
        crNodeWithPropNameIsCached = (contextPath, propName) => this.crNodeIsCached(contextPath) && this.propIsCached(propName)

        cacheNewValueOfPropForCrNode = (contextPath, propName, newVal) => {
            if (this.crNodeIsCached(contextPath)) {
                // same node same prop or same node and new prop
                this.#nodeProperties[propName] = newVal
            } else {
                // must be a new node than before. We flush the cache.
                // maybe Neos Ui will support at one point editing with multiple not applied changes
                // of different nodes but until then this will work.
                this.#nodeContextPath = contextPath
                this.#nodeProperties = {}
                this.#nodeProperties[propName] = newVal
            }
        }
    }
    const singleCrNodeValueCache = new SingleCrNodeValueCache()

    const getLastPropValueFromCacheOrCrCrNode = (crNode, propName) => {
        if (singleCrNodeValueCache.crNodeWithPropNameIsCached(crNode.contextPath, propName)) {
            return singleCrNodeValueCache.getCachedProperty(propName)
        } else {
            // get value of prop that is saved in the Cr/Redux Store
            return crNode.properties[propName]
        }
    }

    const callChangerFunctionWithDomNodeAndChanges = (domNode, changer, propName, newVal, oldVal) => {
        const functionOfProp = liveChangeFunctions[changer.function]
        // if no arguments/null is passed make it an array, so that default values work:
        // function({arguments: something='default'}){}
        const arguments = typeof changer.arguments === 'undefined' ? [] : changer.arguments

        if (typeof functionOfProp === 'undefined')
            console.warn(`The function with name '${changer.function}' from changer`,changer,`could not be found in the global 'liveChangeFunctions' object:`, liveChangeFunctions)

        functionOfProp({
            el: domNode,
            propName,
            newVal,
            oldVal,
            arguments
        })
    }

    const getDomNodesWithChangerByPropNameFromNodeList = (nodeList, propName) => {
        const listOfDomNodesWithChanger = []
        nodeList.forEach(node => {
            for (const [key, rawValue] of Object.entries(node.dataset)) {
                if (key.startsWith('__changeProp') === false)
                    continue

                const possibelMatchingChanger = JSON.parse(rawValue)
                const changer = possibelMatchingChanger[propName]

                if (typeof changer === 'undefined')
                    continue

                listOfDomNodesWithChanger.push({
                    node,
                    changer
                })
            }
        })
        return listOfDomNodesWithChanger
    }

    const changeMarkedDomNodesByProp = (propName, newVal, domNodesWithChangeProps, crNode, typeOfUserAction) => {
        // dont reset props who havent changed and still come with the discard payload.
        if (typeOfUserAction === DISCARD
            && singleCrNodeValueCache.crNodeWithPropNameIsCached(crNode.contextPath, propName) === false)
            return

        const domNodesWithPropToChangeAndChanger = getDomNodesWithChangerByPropNameFromNodeList(domNodesWithChangeProps, propName)

        if (domNodesWithPropToChangeAndChanger.length === 0)
            return

        const oldVal = getLastPropValueFromCacheOrCrCrNode(crNode, propName)

        if (typeOfUserAction === COMMIT) {
            singleCrNodeValueCache.cacheNewValueOfPropForCrNode(crNode.contextPath, propName, newVal)
        } else if (typeOfUserAction === DISCARD) (
            singleCrNodeValueCache.clearCacheOfProp(propName)
        )

        domNodesWithPropToChangeAndChanger.map(
            ({node, changer}) => callChangerFunctionWithDomNodeAndChanges(
                node, changer, propName, newVal, oldVal))
    }

    const getAllDomNodesWithChangePropsByContextPath = contextPath => {
        return document.querySelectorAll(`[data-__change-contextpath="${contextPath}"]`)
    }

    const initializeAndListenForChanges = () => {
        document.addEventListener('MhsDesign.LiveInspectorJsEvents', event => {
            const crNode = event.detail.node
            const properties = event.detail.properties
            const typeOfUserAction = event.detail.message
            const domNodesWithChangeProps = getAllDomNodesWithChangePropsByContextPath(crNode.contextPath)

            if (domNodesWithChangeProps.length > 0 && typeOfUserAction === COMMIT || typeOfUserAction === DISCARD) {
                Object.entries(properties).map(([propName, newVal]) =>
                    changeMarkedDomNodesByProp(propName, newVal, domNodesWithChangeProps, crNode, typeOfUserAction))
            }
        })
    }
    initializeAndListenForChanges()
}
reactToLiveInspectorChanges()
