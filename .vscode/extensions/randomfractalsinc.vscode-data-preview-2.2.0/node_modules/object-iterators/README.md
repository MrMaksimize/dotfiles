# object-iterators

The object iterators, similar in function to those found in underscore.js.

> NOTE: As of v1.2.0, object-iterators is now a simple node module. It is no longer a "modified node module" (containing its own closure for use directly in a browser).

## Synopsis

Node.js:

```javascript
var Base = require('object-iterators').Base;
```

Browser:

```html
<script src="http://joneit.github.io/object-iterators/object-iterators.min.js"></script>
```

Usage example:

```javascript
var obj = {
    id: 30,
    name: 'Jack',
    gender: 'male'
};

print(obj === _(obj).each(function(value, key) { print(key, value); }));
// id 30
// name Jack
// gender male
// true

print(_(obj).reduce(function(memo, value, key) { return memo + (parseInt(value) || 0); }, 100))
// 130

print(_(obj).find(function(value, key) { return value === 'Jack'; }));
// Jack
print(_(obj).find(function(value, key) { return value === 'Jill'; }));
// undefined

function print() { console.log('// ' + Array.prototype.slice.call(arguments).join(' ')); }
```

## API documentation

Detailed API docs can be found [here](http://joneit.github.io/object-iterators/Wrapper.html).

### Demo

A demo can be found [here](http://joneit.github.io/object-iterators/demo.html).

Or see the Underscore docs:

* [each](http://underscorejs.org/#each)
* [find](http://underscorejs.org/#find)
* [reduce](http://underscorejs.org/#reduce)
* [extend](http://underscorejs.org/#extend)
* [extendOwn](http://underscorejs.org/#extendOwn)

Just keep in mind that these are for objects only (not arrays).

### CDN versions

To use in a browser, you have two options:

1. Incorporate the node module into your own browserified project.
2. Use the browserified versions [`object-iterators.js`](http://joneit.github.io/object-iterators/object-iterators.js) or [`object-iterators.min.js`](http://joneit.github.io/object-iterators/object-iterators.min.js) available on the Github pages CDN.

### Submodules

See the note [Regarding submodules](https://github.com/openfin/rectangular#regarding-submodules)
for important information on cloning this repo or re-purposing its build template.
