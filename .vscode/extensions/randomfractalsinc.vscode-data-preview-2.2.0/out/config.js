"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataTypes = exports.supportedFilesFilters = exports.supportedBinaryDataFiles = exports.supportedDataFiles = exports.logLevel = void 0;
const logger_1 = require("./logger");
// log level setting for prod. vs. dev run of this ext.
exports.logLevel = logger_1.LogLevel.Info; // change to .Debug for ext. dev debug
exports.supportedDataFiles = /.*\.(json|jsonl|json5|hjson|ndjson|arrow|arr|avro|parquet|parq|config|env|properties|ini|yaml|yml|md|csv|tsv|txt|tab|dif|ods|xls|xlsb|xlsx|xlsm|xml|html)/;
exports.supportedBinaryDataFiles = /.*\.(arrow|arr|avro|parquet|parq|dif|ods|xls|xlsb|xlsx|xlsm)/;
exports.supportedFilesFilters = {
    'JSON': ['json', 'jsonl', 'json5', 'hjson', 'ndjson'],
    'CSV/TSV': ['csv', 'tsv', 'tab', 'txt'],
    'Excel': ['dif', 'ods', 'xls', 'xlsb', 'xlsx', 'xlsm', 'xml', 'html'],
    'Arrow': ['arrow'],
    'Avro': ['avro'],
    'Config': ['config'],
    'Markdown': ['md'],
    'Properties': ['env', 'ini', 'properties'],
    'YAML': ['yml']
};
// arrow to data view type mappings
// see: https://github.com/finos/perspective/blob/master/packages/perspective/src/js/utils.js
// and https://github.com/finos/perspective/blob/master/packages/perspective/src/js/perspective.js#ArrowColumnLoader
exports.dataTypes = {
    "Binary": "string",
    "Bool": "boolean",
    "Date": "date",
    "Dictionary": "string",
    "Float32": "float",
    "Float64": "float",
    "Int8": "integer",
    "Int16": "integer",
    "Int32": "integer",
    "Int64": "integer",
    "Timestamp": "datetime",
    "Utf8": "string",
};
//# sourceMappingURL=config.js.map