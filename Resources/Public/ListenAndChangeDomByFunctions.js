// global hook in point
if (typeof liveChangeFunctions === "undefined")
    var liveChangeFunctions = {}

function reactToLiveInspectorChanges() {
    // local cache for the COMMIT action
    const lastNodeChange = {
        nodeContextPath: "",
        properties: {}
    }

    function getAllMatchingDomNodesWithChangerByCrNode(domCrNode, propName) {
        function getNodeAndChangerWhenNodeMatchesPropName(node) {
            if (node.matches("[data-__has_change-props]") === false)
                return

            for (const [key, rawValue] of Object.entries(node.dataset)) {
                if (key.startsWith("__changeProps") === false)
                    continue

                const changer = JSON.parse(rawValue)[propName]
                if (changer === undefined)
                    continue

                return {
                    node: node,
                    changer: changer
                }
            }
        }

        function checkIfDomNodeIsTheCurrentCrElementOrHasItAsNextParrent(node) {
            return domCrNode === node || domCrNode === node.closest("[data-__neos-node-contextpath]")
        }

        function checkNodeAndChildrenForMatches(node, output = []){
            if(node === null)
                return

            if(checkIfDomNodeIsTheCurrentCrElementOrHasItAsNextParrent(node) === false)
                return

            const match = getNodeAndChangerWhenNodeMatchesPropName(node)
            if(match)
                output.push(match)

            for(const childNode of node.children)
                checkNodeAndChildrenForMatches(childNode, output)

            return output
        }

        return checkNodeAndChildrenForMatches(domCrNode)
    }

    function callTheChangeFunctionOnThePropDomNodeWithData (domNode, changer, propName, newVal, oldVal) {
        const functionOfProp = liveChangeFunctions[changer.function]
        const arguments = changer.arguments === undefined ? {} : changer.arguments

        if (functionOfProp) {
            functionOfProp({
                el: domNode,
                propName: propName,
                newVal: newVal,
                oldVal: oldVal,
                arguments: arguments
            })
            return
        }
        console.warn(`The function with name '${changer.function}' from changer`,changer,`could not be found in the global 'liveChangeFunctions' object:`, liveChangeFunctions)
    }

    function getValueOfPropThatIsSavedInTheCr(crNode, propName) {
        return crNode.properties[propName]
    }

    function getOldValueOfPropertyByCrNodeAndNameAndCacheNewValueForLater (crNode, propName, newVal, typeOfUserAction) {
        const nodeContextPath = crNode.contextPath
        const lastSavedPropVal = getValueOfPropThatIsSavedInTheCr(crNode, propName)

        if (lastNodeChange.nodeContextPath === nodeContextPath){
            const lastCachedPropVal = lastNodeChange.properties[propName]
            if (lastCachedPropVal){
                // same node same prop
                // save to cache
                if (typeOfUserAction === "COMMIT") {
                    lastNodeChange.properties[propName] = newVal
                }
                return lastCachedPropVal
            }

            // same node new prop
            // save to cache
            if (typeOfUserAction === "COMMIT") {
                lastNodeChange.properties[propName] = newVal
            }
            return lastSavedPropVal
        }

        // new node than before
        lastNodeChange.nodeContextPath = nodeContextPath
        lastNodeChange.properties = {}
        // save to cache (must be COMMIT)
        lastNodeChange.properties[propName] = newVal
        return lastSavedPropVal
    }


    function changeMarkedDomNodesByProp(propName, newVal, domCrNode, crNode, typeOfUserAction) {

        const domNodesWithPropToChangeAndChanger = getAllMatchingDomNodesWithChangerByCrNode(domCrNode, propName)

        if (domNodesWithPropToChangeAndChanger.length === 0)
            return

        const oldVal = getOldValueOfPropertyByCrNodeAndNameAndCacheNewValueForLater(
            crNode, propName, newVal, typeOfUserAction)

        domNodesWithPropToChangeAndChanger.forEach(
            ({node, changer}) => callTheChangeFunctionOnThePropDomNodeWithData(
                node, changer, propName, newVal, oldVal))
    }

    function initializeAndListenForChanges() {
        document.addEventListener("MhsDesign.LiveInspectorJsEvents", (event) => {
            const crNode = event.detail.node
            const domCrNode = document.querySelector(`[data-__neos-node-contextpath="${crNode.contextPath}"]`)
            const properties = event.detail.properties
            const typeOfUserAction = event.detail.message

            if (domCrNode && typeOfUserAction === 'COMMIT' || typeOfUserAction === 'DISCARD') {
                Object.entries(properties).forEach(([propName, newVal]) =>
                    changeMarkedDomNodesByProp(propName, newVal, domCrNode, crNode, typeOfUserAction))
            }
        })
    }
    initializeAndListenForChanges()
}

reactToLiveInspectorChanges()
