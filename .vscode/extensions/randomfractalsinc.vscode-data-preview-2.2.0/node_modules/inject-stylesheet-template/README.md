Resolve registered CSS stylesheet template & inject strategically into head.

### Definitions

_resolve:_ uses [`automat`](https://www.npmjs.com/package/automat) to merge values of optional parameters into stylesheet

_registered:_ dereferenced from the "registry" (_i.e.,_ the calling context)

_strategically:_ inserts each stylesheet consecutively into `<head>` either before first stylesheet loaded with page _or_ at end of `<head>` if nonesuch

### Return value

Returns a reference to the injected `<style>` element.

### Examples

#### Stylesheet registry in a separate file

File: myCssRegistry.js

```javascript
module.exports = {
    day: 'body { background-color: #ffe }',
    eve: 'body { background-color: #666; color: #eee; }'
}
```

In your app layer:

```javascript
var injectFromExternalRegistry = require('inject-stylesheet-template').bind(require('./myCssRegistry'));
injectFromExternalRegistry('day'); // inject <style id="day">body { background-color: #ffe }</style> into <head>
```

#### Stylesheet registry in same file

```javascript
var var injectFromInternalRegistry = require('inject-stylesheet-template');
var registry = {
    day: 'body { background-color: #ffe }',
    eve: 'body { background-color: #666; color: #eee; }'
};
var hr = (new Date).getHours();
injectFromInternalRegistry.call(registry, 6 < hr || hr < 18 ? 'day' : 'eve');
```

#### Non-strict mode

In non-strict mode, you can use the global object as your registry by taking advantage of the default calling context:

```javascript
var inject = ...; // expose the module somehow
var day = 'body { background-color: #ffe }';
inject('day');
```

This is not recommended as it "pollutes the global namespace," but makes for simpler examples...

#### Merge parameter values

```javascript
var box = 'div { background-color: ${0}; color: ${1} }';
inject('box', 'yellow', 'red'); // as resolved: body { background-color: yellow; color: red }
```

#### Inject strategically

```javascript
inject(true, 'day'); // before first stylesheet in <head> loaded with page
inject(false, 'day'); // end of <head>
inject('day'); // per inject.before (true by default)
```

#### Remove injected stylesheet

The return value is useful here:

```javascript
var styleEl = inject(...);
styleEl.remove(); // IE-unfriendly
styleEl.parentNode.removeChild(styleEl); // IE-friendly
```