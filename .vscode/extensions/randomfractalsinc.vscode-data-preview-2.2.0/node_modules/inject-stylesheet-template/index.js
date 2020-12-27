/* eslint-env browser */

'use strict';

var automat = require('automat');

/**
 * @summary Injects the named stylesheet into `<head>`.
 * @desc Stylesheets are inserted consecutively at end of `<head>` unless `before === true` (or omitted and `injectStylesheetTemplate.before` truthy) in which case they are inserted consecutively before first stylesheet found in `<head>` (if any) at load time.
 *
 * The calling context (`this`) is a stylesheet registry.
 * If `this` is undefined, the global stylesheet registry (css/index.js) is used.
 * @this {object}
 * @param {boolean} [before=injectStylesheetTemplate.before] - Add stylesheet before intially loaded stylesheets.
 *
 * _If omitted:_
 * 1. `id` is promoted to first argument position
 * 2. `injectStylesheetTemplate.before` is `true` by default
 * @param {string} id - The name of the style sheet in `this`, a stylesheet "registry" (hash of stylesheets).
 * @returns {Element|*}
 */
function injectStylesheetTemplate(before, id) {
    var optionalArgsStartAt, stylesheet, head, refNode, css, args,
        prefix = injectStylesheetTemplate.prefix;

    if (typeof before === 'boolean') {
        optionalArgsStartAt = 2;
    } else {
        id = before;
        before = injectStylesheetTemplate.before;
        optionalArgsStartAt = 1;
    }

    stylesheet = document.getElementById(prefix + id);

    if (!stylesheet) {
        head = document.querySelector('head');

        if (before) {
            // note position of first stylesheet
            refNode = Array.prototype.slice.call(head.children).find(function(child) {
                var id = child.getAttribute('id');
                return child.tagName === 'STYLE' && (!id || id.indexOf(prefix) !== prefix) ||
                    child.tagName === 'LINK' && child.getAttribute('rel') === 'stylesheet';
            });
        }

        css = this[id];

        if (!css) {
            throw 'Expected to find member `' + id + '` in calling context.';
        }

        args = [
            '<style>\n' + css + '\n</style>\n',
            head,
            refNode || null // explicitly null per https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
        ];

        if (arguments.length > 1) {
            args = args.concat(Array.prototype.slice.call(arguments, optionalArgsStartAt));
        }

        stylesheet = automat.append.apply(null, args)[0];
        stylesheet.id = prefix + id;
    }

    return stylesheet;
}

injectStylesheetTemplate.before = true;
injectStylesheetTemplate.prefix = 'injected-stylesheet-';

module.exports = injectStylesheetTemplate;
