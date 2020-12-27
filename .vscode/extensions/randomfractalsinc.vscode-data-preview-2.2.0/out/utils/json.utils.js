"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectToPropertyArray = exports.flattenObject = exports.convertJsonData = void 0;
const jsonSpread = require("json-spread");
const config = require("../config");
const logger_1 = require("../logger");
const logger = new logger_1.Logger(`json.utils:`, config.logLevel);
/**
 * Converts json data to property array if data is an object.
 * @param data Json data array or object to convert.
 */
function convertJsonData(data) {
    if (!Array.isArray(data)) {
        // convert it to flat object properties array
        data = this.objectToPropertyArray(this.flattenObject(data, true)); // preserve parent path
    }
    else {
        // flatten json data array
        data = jsonSpread(data);
    }
    return data;
}
exports.convertJsonData = convertJsonData;
/**
 * Flattens objects with nested properties for data view display.
 * @param obj Object to flatten.
 * @param preservePath Optional flag for generating key path.
 * @returns Flat Object.
 */
function flattenObject(obj, preservePath = false) {
    const flatObject = {};
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            let children = {};
            Object.assign(children, this.flattenObject(obj[key], preservePath));
            Object.keys(children).forEach(childKey => {
                const propertyName = (preservePath) ? `${key}.${childKey}` : childKey;
                flatObject[propertyName] = children[childKey];
            });
        }
        else if (Array.isArray(obj[key])) {
        }
        else if (obj[key]) {
            flatObject[key] = obj[key].toString();
        }
    });
    return flatObject;
}
exports.flattenObject = flattenObject;
/**
 * Converts an object to an array of property key/value objects.
 * @param obj Object to convert.
 */
function objectToPropertyArray(obj) {
    const properties = [];
    if (obj && obj !== undefined) {
        Object.keys(obj).forEach((key) => {
            properties.push({
                key: key,
                value: obj[key]
            });
        });
    }
    return properties;
}
exports.objectToPropertyArray = objectToPropertyArray;
//# sourceMappingURL=json.utils.js.map