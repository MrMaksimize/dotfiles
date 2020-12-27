# extend-me

A class extender

## Require/include

Node.js / Browserify:

```javascript
var extend = require('extend-me');
```

Browsers:

```html
<script src="http://joneit.github.io/extend-me/extend-me.js"></script>
```
or:
```html
<script src="http://joneit.github.io/extend-me/extend-me.min.js"></script>
```

## Syntax

### First establish a base class

1. Use either the provided `extend.Base` (which provides `super` support):
```javascript
var Base = extend.Base;
```
2. Roll your own base class:
```javascript
var MyBase() { ... }
MyBase.extend = extend;
```

### Then extend it

```javascript
var MyClass = Base.extend(extendedClassName, prototypeAdditions);
```

where:

* `Base` is the base class being extended from. This could also be any descendant class (any class previously extended in this way).
* `extendedClassName` _Optional._ This value, if provided, is copied to the prototype as `$$CLASS_NAME` and is useful in debugging to identify the derived class, the name of which is otherwise (unfortunately) not displayed by the debugger. Could also be useful in your code.  You can also name a class by including `$$CLASS_NAME` or simply `name` in `prototypeAdditions`.
* `prototypeAdditions` _Required._ A prototype object for the new class. The members of this object are added to the new constructor's prototype.

## Usage

```javascript
var MyClass = Base.extend({
    initialize: function () { ... },
    member1: ...,
    member2: ...
};

var MyChildClass = MyClass.extend({
    preInitialize: function () { ... },  // called before base class's initialize() */
    initialize: function () { ... },     // called after base class's initialize() and before derived class's initialize() */
    postInitialize: function () { ... }, // called after this class's initialize() */
    member1: ..., // overrides base class's definition of member1
    member3: ...
};

var a = new MyClass(), b = new MyChildClass();
```

## Example

```javascript
var Parabola = Base.extend({
    initialize: function (a, b) {
        this.a = a;
        this.b = b;
    },
    calculate: function(x) {
        return this.a * Math.pow(x, 2) + (this.b * x);
    }
});

var ParabolaWithIntercept = Parabola.extend({
    initialize: function(a, b, c) {
        this.c = c;
    },
    calculate: function(x) {
        var y = this.super.calculate.apply(this, arguments);
        return y + this.c;
    }
});

var parabola = new ParabolaWithIntercept(3, 2, 1),
    y = parabola.calculate(-3); // yields 22
```

## Constructors

You may optionally supply an `initialize` method to be called as your practical constructor.
It will be called upon object instantiation with the same parameters as passed to the actual constructor.
 
### Initialization Chain

There may be `initialize` methods at each level of inheritance.
Instantiating a derived class will automatically call `initialize` on all ancestor
classes that implement it, starting with the most distant ancestor all the way up to
and including the derived class in question. Each `initialize` method is called
with the same parameters as passed to the constructor.

In the example above, on instantiation (`var paraboloa = new ParabolaWithIntercept(3, 2, 1)`),
`Parabola.prototype.initialize` is called first; then `ParabolaWithIntercept.prototype.initialize`.

To add initialization code to be executed _before_ and/or _after_ this chain of `initialize`
calls, you an define methods `preInitialize` and/or `postInitialize`, respectively. These are _not_
part of the initialization chain. They are only called on the object being instantiated;
they are not called when a derived class is being instantiated.
For example, in the sample usage above, if `MyClass` had had a `preInitialize` method,
it would be called on `a`'s intantiation but not `b`'s.

## `Base`

A base class is provided in `extend.Base`. This base class contains the methods described below.

Use of `Base` is not required, however, as you can also create your own base class simply by adding `extend` to it (see [Syntax](#syntax) above).

```js
function MyBase() {}
MyBase.extend = extend;

The following methods are available in the prototype of `extend.Base`. 

### `super`
Reference to the immediate ancestor in the prototype chain. Implemented as a getter on the `Base`'s prototype. See example above.

### `superMember(memberName)`
Find member on prototype chain beginning with super class.

### `superMethod(methodName)`
Find method on prototype chain beginning with super class.

### `callSuperMethod(methodName, arg1, arg2, arg3, ...)`
Find method on prototype chain beginning with super class and call it with remaining args.

## API documentation

Detailed API docs can be found [here](http://joneit.github.io/extend-me/extend-me.html).

## Demo

A demo can be found [here](http://joneit.github.io/extend-me/demo.html).

## Update history

### v2.6.0
* Added `postExtend`, an optional static method of the base "class" (constructor). When defined, it is called at the end of `extend()` with the new "class" (new constructor) as its sole parameter. This permits miscellaneous tweaking and cleanup of the new class.

### v2.5.0
* Added `parent(/*optional*/ancestorConstructorName)` to constructor to get the parent class's constructor or the named ancestor class's constructor.
* Now resets returned constructor's `name` to `extendedClassName` OR `prototypeAdditions.$$CLASS_NAME` in the prototype OR `prototypeAdditions.name`

### v2.4.0
Previously, on instantiation, the `preInitialize` and `postInitialize` methods were called if and only if they were defined on the subclass's (extended object's) own prototype. This has been changed so that the "top" such methods on the prototype chain are now called, whether defined on the extended class or on an ancestor class. As before, these methods are called before and after the `initialize` cascade, respectively. Unlike `initialize`, however, there is no cascade; only the top most method is ever called.

This was an oversight and the workaround has been to forward the calls by redefining new methods with these names whose sole function was to forward the call to `this.super`. This change is backwards compatible with that workaround; it will simply call the forwarding method as before. However, it is now safe to remove the forwarding methods altogether and the call will be made for you.

This can be considered a breaking change because previously without the workarounds, such ancestor methods were not executed. If you were dependent on this unlikely scenario, you can restore that behavior by defining new methods with these names as no-ops.


## Submodules

See the note [Regarding submodules](https://github.com/openfin/rectangular#regarding-submodules)
for important information on cloning this repo or re-purposing its build template.
