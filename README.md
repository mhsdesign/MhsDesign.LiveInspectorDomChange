# MhsDesign.LiveInspectorDomChange

## Plugin for live inspector editing

### install this package:

```
composer require mhsdesign/liveinspectordomchange
```

![demo-live-changer-neos (2)](https://user-images.githubusercontent.com/85400359/132108191-da689307-818f-445a-b545-b0f3041a7b99.gif)


## Usage
### activate live editing in your Fusion component:

The EEL Helper will render some attributes only in the backend into your markup.

This will allow to change the class:
```ts
prototype(Vendor.Site:Content.Example) < prototype(Neos.Neos:ContentComponent) {

    padding = ${q(node).property('padding')}
    paddingClassChanger = ${Editable.attributes(node, 'padding', 'changeClass')}

    renderer = afx`
        <div class={props.padding} {...props.paddingClassChanger}></div>
    `
}
```

The EEL Helper `Editable.attributes` will return an array of attributes which need to be applied via Fusion @apply or as AFX spread on the html element that should be live updated.

### Multiple `Editable.attributes` on one html element:
just add two spreads on the same html element.
`<div {...Editable.attributes(...)} {...Editable.attributes(...)}></div>`

you can also concat them beforehand via:
`Array.concat(Editable.attributes(...), Editable.attributes(...))`
and apply this as a spread to your html element.

## API:

### EEL Helper
```js
${Editable.attributes(node, propName, changerFunction)}
${Editable.attributes(node, propName, changerFunction, changerArguments)}
```
- `node` (NodeInterface):       Any node - used to detect if site is rendered in backend or live
- `propName` (string):          Name of the property - must be the same as in the CR (Yaml declaration) 
- `changerFunction` (string)    Name of the function to execute. (Key of the Js `liveChangeFunctions` object)
- `changerArguments` (mixed)    Additional arguments for the Javascript function. Can be of any type as long as they can be Json encoded.

### Javascript 'Changer' functions

All accessible functions must be 'registered' on the global object `liveChangeFunctions`.

Predefined functions:
- `changeClass`
- `changeStyle`: requires the `changerArguments` to be a string and a valid property of `HTMLElement.style`
- `changeText`


### Create a custom Javascript 'Changer' function

**Add this to your Javascript in the backend iframe.**
```js
liveChangeFunctions.myFunctionName = ({el, propName, newVal, oldVal, arguments}) => {
    el // is the current dom element.
    el.innerText = newVal
}
```
**Use it like:**
```js
${Editable.attributes(node, 'something', 'myFunctionName')}
```

## MhsDesign.LiveInspectorJsEvents
this Package relies on the Package MhsDesign.LiveInspectorJsEvents https://github.com/mhsdesign/MhsDesign.LiveInspectorJsEvents. Which sends the Javascript events to the iframe.
