# overrider
JavasScript shallow object copier that supports getters/setters

### Require/include

Node.js / Browserify:

```javascript
var overrider = require('overrider').Base;
```

Browsers:

```html
<script src="http://joneit.github.io/overrider/overrider.js"></script>
```
or:
```html
<script src="http://joneit.github.io/overrider/overrider.min.js"></script>
```

### Usage

```javascript
var a = { a: 3 };
var b = { b: 5 };
var c = { get abc() { return this.c }, set abc(x) { this.c = x } };
var object = overrider(a, b, c); // result is `a` which now has an `a.b` and the `a.abc` getter and setter
```

### Documentation

Detailed documentation can be found [here](https://joneit.github.io/overrider/global.html#overrider).

### Submodules

See the note [Regarding submodules](https://github.com/openfin/rectangular#regarding-submodules)
for important information on cloning this repo or re-purposing its build template.
