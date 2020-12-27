'use strict';

/**
 * @classdesc Concatenated data model base class.
 * @param {Datasaur} [next] - Omit for origin (actual data source). Otherwise, point to source you are transforming.
 * @param {object} [options] - Not used here at this time. Define properties as needed for custom datasaurs.
 */
var DatasaurBase = require('extend-me').Base.extend('DatasaurBase', {
    isNullObject: true,

    drillDownCharMap: {
        true: '\u25bc', // BLACK DOWN-POINTING TRIANGLE aka '▼'
        false: '\u25b6', // BLACK RIGHT-POINTING TRIANGLE aka '▶'
        undefined: '', // leaf rows have no control glyph
        null: '   ' // indent
    },

    DataError: DataError,

    initialize: function(next, options) {
        if (next) {
            this.handlers = next.handlers;
            this.next = next;
            while (next) {
                this.source = next;
                next = next.next;
            }
        } else {
            this.handlers = [];
            this.source = this;
        }

        this.install(Object.getPrototypeOf(this));
    },

    /**
     * @implements dataModelAPI#install
     * @see {@link https://fin-hypergrid.github.io/core/doc/dataModelAPI.html#install|install}
     */
    install: function(api, options) {
        options = options || {};

        var dataModel = this,
            keys = getFilteredKeys(api),
            injectable = options.inject && !Array.isArray(api);

        keys.forEach(function(key) {
            if (injectable) {
                if (!findMethod(dataModel, key, options.force)) {
                    this.source[key] = api[key];
                }
            }

            if (!DatasaurBase.prototype[key]) {
                DatasaurBase.prototype[key] = function() {
                    if (this.next) {
                        return this.next[key].apply(this.next, arguments);
                    }
                };
            }
        }, this);
    },

    dispatchEvent: function(nameOrEvent) {
        this.handlers.forEach(function(handler) {
            handler.call(this, nameOrEvent);
        }, this);
    },

    addListener: function(handler) {
        if (this.handlers.indexOf(handler) < 0) {
            this.handlers.push(handler);
        }
    },

    removeListener: function(handler) {
        var index = this.handlers.indexOf(handler);
        if (index >= 0) {
            delete this.handlers[index];
        }
    },

    removeAllListeners: function() {
        this.handlers.length = 0;
    },


    // DEBUGGING AIDS

    dump: function(max) {
        max = Math.min(this.getRowCount(), max || Math.max(100, this.getRowCount()));
        var data = [];
        var schema = this.getSchema();
        var fields = schema ? schema.map(function(cs) { return cs.name; }) : this.getHeaders();
        var cCount = this.getColumnCount();
        var viewMakesSense = this.viewMakesSense;
        for (var r = 0; r < max; r++) {
            var row = {};
            for (var c = 0; c < cCount; c++) {
                var val = this.getValue(c, r);
                if (c === 0 && viewMakesSense) {
                    val = this.fixIndentForTableDisplay(val);
                }
                row[fields[c]] = val;
            }
            data[r] = row;
        }
        console.table(data);
    }
});

/**
 * Searches linked list of objects for implementation of property `key` anywhere on their prototype chain.
 * The search excludes members of `DatasaurBase.prototype` (previously installed forwarding catchers).
 * @param {object} transformer - Data model transformer list, linked backwards one to the previous one by `next` property.
 * The first transformer, the actual data source, has null `next`, meaning start-of-list.
 * @param {string} key - Property to search for.
 * @param {boolean} [remove] - Delete all implementations along prototype chains of all transformers and return falsy.
 * @returns {undefined|function} - Found method implementation or `undefined` if not found.
 */
function findMethod(transformer, key, remove) {
    do {
        if (transformer[key]) {
            if (remove) {
                for (var link = transformer; link && link !== Object.prototype; link = Object.getPrototypeOf(link)) {
                    delete link[key];
                }
            } else if (transformer[key] !== DatasaurBase.prototype[key]) {
                return transformer[key];
            }
        }
        transformer = transformer.next;
    } while (transformer);
}

var blacklistAlways = ['constructor', 'initialize', '!keys', '!!keys'];

/**
 * The following keys (array elements or object keys) are filtered out:
 * * Defined as something other than a function, including an accessor (getter and/or setter)
 * * Keys missing from whitelist (not listed in string array `api['!!keys']`, when defined)
 * * Keys blacklisted (listed in string array `api['!keys']` or `blacklistAlways`)
 * @param {string[]|object} api
 * @returns {string[]}
 */
function getFilteredKeys(api) {
    var whitelist = api.hasOwnProperty('!!keys') && api['!!keys'],
        blacklist = blacklistAlways.concat(api.hasOwnProperty('!keys') && api['!keys'] || []),
        keys;

    if (Array.isArray(api)) {
        keys = api;
    } else {
        keys = Object.keys(api).filter(function(key) {
            return typeof Object.getOwnPropertyDescriptor(api, key).value === 'function';
        });
    }

    return keys.filter(function(key) {
        return !(
            whitelist && whitelist.indexOf(key) < 0 ||
            blacklist.indexOf(key) >= 0
        );
    });
}


// DataError

function DataError(message) {
    this.message = message;
}

// extend from `Error'
DataError.prototype = Object.create(Error.prototype);

// override error name displayed in console
DataError.prototype.name = 'DataError';


module.exports = DatasaurBase;
