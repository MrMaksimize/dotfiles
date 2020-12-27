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
exports.JsonDataProvider = void 0;
const vscode_1 = require("vscode");
const fs = require("fs");
const jsonc_parser_1 = require("jsonc-parser");
const config = require("../config");
const fileUtils = require("../utils/file.utils");
const jsonUtils = require("../utils/json.utils");
const logger_1 = require("../logger");
/**
 * JSON data provider.
 */
class JsonDataProvider {
    /**
     * Creates new JSON data provider for .config, .json, .json5, .hjson data files.
     */
    constructor() {
        // TODO: add mime types later for http data loading
        // TODO: move .config to separate data.provider ???
        this.supportedDataFileTypes = ['.config', '.json'];
        this.logger = new logger_1.Logger('json.data.provider:', config.logLevel);
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
            try {
                let content = String(yield fileUtils.readDataFile(dataUrl, 'utf8'));
                let parseErrors = [];
                data = jsonc_parser_1.parse(content, parseErrors, {
                    disallowComments: false,
                    allowTrailingComma: true
                }); //JSON.parse(content);
                if (parseErrors && parseErrors.length > 0) {
                    // log and display json parse errors
                    let jsonErrors = '';
                    for (const error of parseErrors) {
                        jsonErrors += `${jsonc_parser_1.printParseErrorCode(error.error)} at ${error.offset} of ${error.length} length \n`;
                    }
                    this.logger.logMessage(logger_1.LogLevel.Error, `getData(): Error parsing '${dataUrl}' \n\t Error:`, jsonErrors);
                    vscode_1.window.showErrorMessage(`Invalid json data file: '${dataUrl}'. \n\t Error(s): \n ${jsonErrors}`);
                }
            }
            catch (error) {
                this.logger.logMessage(logger_1.LogLevel.Error, `getData(): Error parsing '${dataUrl}' \n\t Error:`, error.message);
                vscode_1.window.showErrorMessage(`Unable to parse data file: '${dataUrl}'. \n\t Error: ${error.message}`);
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
exports.JsonDataProvider = JsonDataProvider;
//# sourceMappingURL=json.data.provider.js.map