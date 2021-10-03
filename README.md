# Edit your Neos Site with more* live feedback!
*Neos features already a great inline editor: [www.neos.io](https://www.neos.io/features/inline-editing-true-wysiwyg.html)

**Neos CMS Plugin for live inspector editing:**
## MhsDesign.LiveInspectorDomChange
*(the most non-advertising name - but thats what happening)*

### Install this package via composer:
```
composer require mhsdesign/liveinspectordomchange
```
**Demo Video:**
![demo-live-changer-neos (2)](https://user-images.githubusercontent.com/85400359/132108191-da689307-818f-445a-b545-b0f3041a7b99.gif)
*thanks, @Sebobo for https://github.com/Sebobo/Shel.Neos.ColorPicker*

## Usage
### Activate live inspector editing in your Fusion component:

<details>
<summary>A basic (standalone) nodeType with a select box (nothing special in here)</summary>
<p>

```yaml
'Vendor.Site:Content.Example':
  superTypes:
    'Neos.Neos:Content': true
  ui:
    icon: 'icon-internet-explorer'
    label: 'Example'
    # this will remove the Neos not inline editable overlay.
    inlineEditable: true
    inspector:
    groups:
      settings:
      label: 'Settings'
  properties:
    height:
    type: string
    ui:
      # not need to explicitly state it since its the default:
      # reloadIfChanged: false
      label: 'Height'
      inspector:
      group: settings
      editor: 'Neos.Neos/Inspector/Editors/SelectBoxEditor'
      editorOptions:
        allowEmpty: true
        values:
          # your css classes as key.
          height-sm:
            label: 'Small'
          height-md:
            label: 'Medium'
          height-lg:
            label: 'Large'
```
</p>
</details>

This Fusion will allow to change the class:
```ts
prototype(Vendor.Site:Content.Example) < prototype(Neos.Neos:ContentComponent) {

  height = ${q(node).property('height')}
  heightClassChanger = ${Editable.attributes(node, 'height', 'changeClass')}

  renderer = afx`
    <div class={props.height} {...props.heightClassChanger}></div>
  `
}
```

The EEL Helper `Editable.attributes` will return an array of attributes which need to be applied via Fusion @apply or as AFX spread on the HTML element that should be updated live.

(Those spreads work exacly like in Js World: `<p {... {'key': 'value'} }></p>` will be rendered as `<p key="value"></p>`)

*The EEL Helper will render those attributes only in the backend into your markup.*

### Multiple `Editable.attributes` on one HTML element:
just add two spreads on the same HTML element.
`<div {...Editable.attributes()} {...Editable.attributes()}></div>`

you can also concat them beforehand via:
`Array.concat(Editable.attributes(), Editable.attributes())`
and apply this as a spread to your HTML element.

*note that multiple editable attributes on one HTML element must come from the same node!*

## API:

### EEL Helper
```js
${Editable.attributes(node, propName, changerFunction, changerArguments=null)}
```
- `node` (NodeInterface):     The current node which has the property.
- `propName` (string):      Name of the property - must be the same name as in the CR (Yaml declaration) and belong to the `node` otherwise an exception is thrown.
- `changerFunction` (string)  Name of the function to execute. (Key of the Js `liveChangeFunctions` object)
- `changerArguments` (mixed)  Additional arguments for the JavaScript function. Can be of any type as long as they can be Json encoded. *Note: if null is provided it will be converted in JavaScript to an empty array to allow nested default parameters.*

### JavaScript 'Changer' functions

All functions must be 'registered' on the global object `liveChangeFunctions`.

Predefined functions:
- `changeClass`
    - `changerArguments`: none
    - example: `${Editable.attributes(node, 'height', 'changeClass')}`
- `changeStyle`
    - `changerArguments`: string and a valid property of `HTMLElement.style`
    - example: `${Editable.attributes(node, 'color', 'changeStyle', 'color')}`
- `changeText`
    - `changerArguments`: none
    - example: `${Editable.attributes(node, 'color', 'changeStyle', 'color')}`
- `clientEval`
    - `changerArguments`: string, which will evaluated via JavaScript eval*. `el, propName, newVal, oldVal` are usable.
    - example: `${Editable.attributes(node, 'color', 'clientEval', 'el.textContent = newVal; console.log(oldVal);')}`

\* yes I'm evil for using eval.

### Create a custom JavaScript 'Changer' function

**Add this to your JavaScript in the backend iframe.**
```js
liveChangeFunctions.myFunctionName = ({el, propName, newVal, oldVal, arguments}) => {
  el // is the current dom element.
  el.textContent = newVal
}
```
**Use it like:**
```js
${Editable.attributes(node, 'something', 'myFunctionName')}
```

## FAQ:

### I dont want to pollute my Fusion:
see #1

### Limitations:

* It doesnt work for images, as 'Redux Cr node' doesnt know about an image uri. (it would probably work to use an endpoint but then complex server operations like responsive images via Fusion wont work easily. `reloadIfChanged: true` is a better option.)
* It doenst work yet for toggling HTML elements. But you could build yourself a Fusion Vendor:Toogle Object, which will accept a condition and in the backend sets the style to display:none and for live toggling implements a JS helper. Or use a custom web component and use el.customFunction() on the web component in a customChanger.
* You cant have two nodes controlling one HTML element.

### Internal workings:

**The live updates are evaluated via the nodes contextPath.**
that means that as long as you specify the right node as parameter to the Editable.attributes, it will work.

for more information look at the tests ;)
[./Tests/JavaScript/](./Tests/JavaScript/)
[./Tests/Unit/](./Tests/Unit/)

#### Test:

run the phpunit tests from your flow root:

```sh
./bin/phpunit -c ./Build/BuildEssentials/PhpUnit/UnitTests.xml ./Packages/Application/MhsDesign.LiveInspectorDomChange/Tests
```

run the JavaScript jest test in the location ./Tests/JavaScript
```sh
# optional
# nvm install && nvm use
# npm install --global yarn
yarn install
yarn test
```

#### MhsDesign.LiveInspectorJsEvents
this Package relies on the Package MhsDesign.LiveInspectorJsEvents https://github.com/mhsdesign/MhsDesign.LiveInspectorJsEvents. Which sends the JavaScript events to the iframe.
