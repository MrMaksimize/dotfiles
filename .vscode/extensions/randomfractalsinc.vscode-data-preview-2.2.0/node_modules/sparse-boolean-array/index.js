'use strict';

/* eslint-env node, browser */

(function (module) {  // eslint-disable-line no-unused-expressions

    // This closure supports NodeJS-less client side includes with <script> tags. See https://github.com/joneit/mnm.

    /**
     * @constructor RangeSelectionModel
     *
     * @desc This object models selection of "cells" within an abstract single-dimensional matrix.
     *
     * Disjoint selections can be built with calls to the following methods:
     * * {@link RangeSelectionModel#select|select(start, stop)} - Add a range to the matrix.
     * * {@link RangeSelectionModel#deselect|deselect(start, stop)} - Remove a range from the matrix.
     *
     * Two more methods are available:
     * * Test a cell to see if it {@link RangeSelectionModel#isSelected|isSelected(cell)}
     * * {@link RangeSelectionModel#clear|clear()} the matrix
     *
     * Internally, the selection is run-length-encoded. It is therefore a "sparse" matrix
     * with undefined bounds. A single data property called `selection` is an array that
     * contains all the "runs" (ranges) of selected cells albeit in no particular order.
     * This property should not normally need to be accessed directly.
     *
     * Note: This object should be instantiated with the `new` keyword.
     *
     * @returns {RangeSelectionModel} Self (i.e., `this` object).
     */
    function RangeSelectionModel() {
        /**
         * @name selection
         * @type {Array.Array.number}
         * @summary Unordered list of runs.
         * @desc A "run" is defined as an Array(2) where:
         * * element [0] is the beginning of the run
         * * element [1] is the end of the run (inclusive) and is always >= element [0]
         * The order of the runs within is undefined.
         * @memberOf RangeSelectionModel.prototype
         * @abstract
         */
        this.selection = [];

        //we need to be able to go back in time
        //the states field
        this.states = [];

        //clone and store my current state
        //so we can unwind changes if need be
        this.storeState = function () {
            var sels = this.selection;
            var state = [];
            var copy;
            for (var i = 0; i < sels.length; i++) {
                copy = [].concat(sels[i]);
                state.push(copy);
            }
            this.states.push(state);
        };
    }

    RangeSelectionModel.prototype = {

        /**
         * @summary Add a contiguous run of points to the selection.
         * @desc Insert a new run into `this.selection`.
         * The new run will be merged with overlapping and adjacent runs.
         *
         * The two parameters may be given in either order.
         * The start and stop elements in the resulting run will however always be ordered.
         * (However, note that the order of the runs within `this.selection` is itself always unordered.)
         *
         * Note that `this.selection` is updated in place, preserving validity of any external references.
         * @param {number} start - Start of run. May be greater than `stop`.
         * @param {number} [stop=stop] - End of run (inclusive). May be less than `start`.
         * @returns {RangeSelectionModel} Self (i.e., `this`), for chaining.
         * @memberOf RangeSelectionModel.prototype
         */
        select: function (start, stop) {
            this.storeState();
            var run = makeRun(start, stop);
            var splicer = [0, 1];
            this.selection.forEach(function (each) {
                if (overlaps(each, run) || abuts(each, run)) {
                    run = merge(each, run);
                } else {
                    splicer.push(each);
                }
            });
            splicer.push(run);
            splicer[1] = this.selection.length;
            this.selection.splice.apply(this.selection, splicer); // update in place to preserve external references
            return this;
        },

        /**
         * @summary Remove a contiguous run of points from the selection.
         * @desc Truncate and/or remove run(s) from `this.selection`.
         * Removing part of existing runs will (correctly) shorten them or break them into two fragments.
         *
         * The two parameters may be given in either order.
         *
         * Note that `this.selection` is updated in place, preserving validity of any external references.
         * @param {number} start - Start of run. May be greater than `stop`.
         * @param {number} [stop=stop] - End of run (inclusive). May be less than `start`.
         * @returns {RangeSelectionModel} Self (i.e., `this`), for chaining.
         * @memberOf RangeSelectionModel.prototype
         */
        deselect: function (start, stop) {
            var run = makeRun(start, stop);
            var splicer = [0, 0];
            this.selection.forEach(function (each) {
                if (overlaps(each, run)) {
                    var pieces = subtract(each, run);
                    splicer = splicer.concat(pieces);
                } else {
                    splicer.push(each);
                }
            });
            splicer[1] = this.selection.length;
            this.selection.splice.apply(this.selection, splicer); // update in place to preserve external references
            return this;
        },

        /**
         * @summary Empties `this.selection`, effectively removing all runs.
         * @returns {RangeSelectionModel} Self (i.e., `this`), for chaining.
         * @memberOf RangeSelectionModel.prototype
         */
        clear: function () {
            this.states.length = 0;
            this.selection.length = 0;
            return this;
        },

        clearMostRecentSelection: function () {
            if (this.states.length === 0) {
                return;
            }
            this.selection = this.states.pop();
        },

        /**
         * @summary Determines if the given `cell` is selected.
         * @returns {boolean} `true` iff given `cell` is within any of the runs in `this.selection`.
         * @param {number} cell - The cell to test for inclusion in the selection.
         * @memberOf RangeSelectionModel.prototype
         */
        isSelected: function (cell) {
            return this.selection.some(function (each) {
                return each[0] <= cell && cell <= each[1];
            });
        },

        isEmpty: function (){
            return this.selection.length === 0;
        },

        /**
         * @summary Return the indexes that are selected.
         * @desc Return the indexes that are selected.
         * @returns {Array.Array.number}
         * @memberOf RangeSelectionModel.prototype
         */
        getSelections: function (){
            var result = [];
            this.selection.forEach(function (each) {
                for (var i = each[0]; i <= each[1]; i++) {
                    result.push(i);
                }
            });
            result.sort(function (a, b){
                return a - b;
            });
            return result;
        }

    };

    /**
     * @private
     * @summary Preps `start` and `stop` params into order array
     * @function makeRun
     * @desc Utility function called by both `select()` and `deselect()`.
     * @param {number|number[]} start - Start of run. if array, `start` and `stop` are taken from first two elements.
     * @param {number} [stop=start] - End of run (inclusive).
     */
    function makeRun(start, stop) {
        return (
            start instanceof Array
                ? makeRun.apply(this, start) // extract params from given array
                : stop === undefined
                ? [ start, start ] // single param is a run that stops where it starts
                : start <= stop
                ? [ start, stop ]
                : [ stop, start ] // reverse descending params into ascending order
        );
    }

    /**
     * @private
     * @function overlaps
     * @returns {boolean} `true` iff `run1` overlaps `run2`
     * @summary Comparison operator that determines if given runs overlap with one another.
     * @desc Both parameters are assumed to be _ordered_ arrays.
     *
     * Overlap is defined to include the case where one run completely contains the other.
     *
     * Note: This operator is commutative.
     * @param {number[]} run1 - first run
     * @param {number[]} run2 - second run
     */
    function overlaps(run1, run2) {
        return (
            run1[0] <= run2[0] && run2[0] <= run1[1] || // run2's start is within run1 OR...
            run1[0] <= run2[1] && run2[1] <= run1[1] || // run2's stop is within run1 OR...
            run2[0] <  run1[0] && run1[1] <  run2[1]    // run2 completely contains run1
        );
    }

    /**
     * @private
     * @function abuts
     * @summary Comparison operator that determines if given runs are consecutive with one another.
     * @returns {boolean} `true` iff `run1` is consecutive with `run2`
     * @desc Both parameters are assumed to be _ordered_ arrays.
     *
     * Note: This operator is commutative.
     * @param {number[]} run1 - first run
     * @param {number[]} run2 - second run
     */
    function abuts(run1, run2) {
        return (
            run1[1] === run2[0] - 1 || // run1's top immediately precedes run2's start OR...
            run2[1] === run1[0] - 1    // run2's top immediately precedes run1's start
        );
    }

    /**
     * @private
     * @function subtract
     * @summary Operator that subtracts one run from another.
     * @returns {Array.Array.number} The remaining pieces of `minuend` after removing `subtrahend`.
     * @desc Both parameters are assumed to be _ordered_ arrays.
     *
     * This function _does not assumes_ that `overlap()` has already been called with the same runs and has returned `true`.
     *
     * Returned array contains 0, 1, or 2 runs which are the portion(s) of `minuend` that do _not_ include `subtrahend`.
     *
     * Caveat: This operator is *not* commutative.
     * @param {number[]} minuend - a run from which to "subtract" `subtrahend`
     * @param {number[]} subtrahend - a run to "subtracted" from `minuend`
     */
    function subtract(minuend, subtrahend) {
        var m0 = minuend[0];
        var m1 = minuend[1];
        var s0 = subtrahend[0];
        var s1 = subtrahend[1];
        var result = [];

        if (s0 <= m0 && s1 < m1) {
            //subtrahend extends before minuend: return remaining piece of `minuend`
            result.push([s1 + 1, m1]);
        } else if (s0 > m0 && s1 >= m1) {
            //subtrahend extends after minuend: return remaining piece of `minuend`
            result.push([m0, s0 - 1]);
        } else if (m0 < s0 && s1 < m1) {
            //completely inside: return 2 smaller pieces resulting from the hole
            result.push([m0, s0 - 1]);
            result.push([s1 + 1, m1]);
        } else if (s1 < m0 || s0 > m1) {
            // completely outside: return `minuend` untouched
            result.push(minuend);
        }

        //else subtrahend must completely overlap minuend so return no pieces

        return result;
    }


    // Local utility functions

    /**
     * @private
     * @function merge
     * @summary Operator that merges given runs.
     * @returns {number[]} A single merged run.
     * @desc Both parameters are assumed to be _ordered_ arrays.
     *
     * The runs are assumed to be overlapping or adjacent to one another.
     *
     * Note: This operator is commutative.
     * @param {number[]} run1 - a run to merge with `run2`
     * @param {number[]} run2 - a run to merge with `run1`
     */
    function merge(run1, run2) {
        var min = Math.min(Math.min.apply(Math, run1), Math.min.apply(Math, run2));
        var max = Math.max(Math.max.apply(Math, run1), Math.max.apply(Math, run2));
        return [min, max];
    }

    // Interface
    module.exports = RangeSelectionModel;
})(
    typeof module === 'object' && module || (window.RangeSelectionModel = {}),
    typeof module === 'object' && module.exports || (window.RangeSelectionModel.exports = {})
) || (
    typeof module === 'object' || (window.RangeSelectionModel = window.RangeSelectionModel.exports)
);

/* About the above IIFE:
 * This file is a "modified node module." It functions as usual in Node.js *and* is also usable directly in the browser.
 * 1. Node.js: The IIFE is superfluous but innocuous.
 * 2. In the browser: The IIFE closure serves to keep internal declarations private.
 * 2.a. In the browser as a global: The logic in the actual parameter expressions + the post-invocation expression
 * will put your API in `window.RangeSelectionModel`.
 * 2.b. In the browser as a module: If you predefine a `window.module` object, the results will be in `module.exports`.
 * The bower component `mnm` makes this easy and also provides a global `require()` function for referencing your module
 * from other closures. In either case, this works with both NodeJs-style export mechanisms -- a single API assignment,
 * `module.exports = yourAPI` *or* a series of individual property assignments, `module.exports.property = property`.
 *
 * Before the IIFE runs, the actual parameter expressions are executed:
 * 1. If `window` object undefined, we're in NodeJs so assume there is a `module` object with an `exports` property
 * 2. If `window` object defined, we're in browser
 * 2.a. If `module` object predefined, use it
 * 2.b. If `module` object undefined, create a `RangeSelectionModel` object
 *
 * After the IIFE returns:
 * Because it always returns undefined, the expression after the || will execute:
 * 1. If `window` object undefined, then we're in NodeJs so we're done
 * 2. If `window` object defined, then we're in browser
 * 2.a. If `module` object predefined, we're done; results are in `moudule.exports`
 * 2.b. If `module` object undefined, redefine`RangeSelectionModel` to be the `RangeSelectionModel.exports` object
 */
