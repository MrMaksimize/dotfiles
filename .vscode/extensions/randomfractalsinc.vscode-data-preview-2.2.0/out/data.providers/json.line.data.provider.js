"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonLineDataProvider = void 0;
const vscode_1 = require("vscode");
const fs = require("fs");
const config = require("../config");
const fileUtils = require("../utils/file.utils");
const jsonUtils = require("../utils/json.utils");
const logger_1 = require("../logger");
/**
 * JSON Line data provider.
 * @see http://jsonlines.org/
 */
class JsonLineDataProvider {
    /**
     * Creates new JSON Line data provider for .jsonl and .ndjson data files.
     */
    constructor() {
        // TODO: add mime types later for http data loading
        this.supportedDataFileTypes = ['.jsonl', '.ndjson'];
        this.logger = new logger_1.Logger('json.line.data.provider:', config.logLevel);
        this.logger.debug('created for:', this.supportedDataFileTypes);
    }
    /**
     * Gets local or remote data.
     * @param dataUrl Local data file path or remote data url.
     * @param parseOptions Data parse options.
     * @param loadData Load data callback.
     */
    getData(dataUrl, parseOptions, loadData) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = [];
            let lineIndex = 1;
            try {
                let content = String(yield fileUtils.readDataFile(dataUrl, 'utf8'));
                const jsonLines = content.split('\n');
                jsonLines.forEach(jsonLine => {
                    const trimmedJsonLine = jsonLine.trim();
                    if (trimmedJsonLine.length > 0) {
                        data.push(JSON.parse(trimmedJsonLine));
                    }
                    lineIndex++;
                });
            }
            catch (error) {
                this.logger.logMessage(logger_1.LogLevel.Error, `getData(): Error parsing '${dataUrl}' \
        \n\t line #: ${lineIndex} Error:`, error.message);
                vscode_1.window.showErrorMessage(`Unable to parse data file: '${dataUrl}'. \
        \n\t Line #: ${lineIndex} Error: ${error.message}`);
            }
            loadData(jsonUtils.convertJsonData(data));
        });
    }
    /**
     * Gets data table names for data sources with multiple data sets.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataTableNames(dataUrl) {
        return []; // none for json data files
    }
    /**
     * Gets data schema in json format for file types that provide it.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataSchema(dataUrl) {
        // TODO: auto-gen json schema ???
        return null; // none for json data files
    }
    /**
     * Saves JSON data.
     * @param filePath Local data file path.
     * @param fileData Raw data to save.
     * @param tableName Table name for data files with multiple tables support.
     * @param showData Show saved data callback.
     */
    saveData(filePath, fileData, tableName, showData) {
        fileData = JSON.stringify(fileData, null, 2);
        if (fileData.length > 0) {
            // TODO: change this to async later
            fs.writeFile(filePath, fileData, (error) => showData(error));
        }
    }
}
exports.JsonLineDataProvider = JsonLineDataProvider;
//# sourceMappingURL=json.line.data.provider.js.map