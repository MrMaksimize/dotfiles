# automat
String and markup formatter.

## Features

* String formatting
  * Text substitution via numbered text substitution patterns
  * Substitution patterns overrideable
  * Optional Extraction of a template from a function comment
  * Optional HTML encoding of substituted text
* DOM node convenience methods convert your formatted markup to DOM nodes and:
  * Return them in a new `<div>...</div>` element; or
  * Return them in an existing `HTMLElement` you provide.
  * Append/insert them into an existing `HTMLElement` you provide.

## Update history
v1.2.0:
* Removed ability to extract a template from a function body comment. Comment was elided on minification making this device unusable.
* Fixed problem with .firstChild() and .firstElement() methods.

## Examples

See tests.

### API documentation

Detailed API docs can be found [here](http://joneit.github.io/automat).

### Demo

A demo can be found [here](http://joneit.github.io/automat/demo.html).

### CDN versions

To use in a browser, you have two options:

1. Incorporate the node module into your own browserified project.
2. Use the browserified versions [`automat.js`](http://joneit.github.io/automat/automat.js) or [`automat.min.js`](http://joneit.github.io/automat/automat.min.js) available on the _Github Pages_ CDN.

### Submodules

See the note [Regarding submodules](https://github.com/openfin/rectangular#regarding-submodules)
for important information on cloning this repo or re-purposing its build template.
