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
exports.PropertiesDataProvider = void 0;
const vscode_1 = require("vscode");
const fs = require("fs");
const props = require("properties");
const config = require("../config");
const fileUtils = require("../utils/file.utils");
const jsonUtils = require("../utils/json.utils");
const logger_1 = require("../logger");
/**
 * Properties data provider for .properties, .ini and .env data files.
 */
class PropertiesDataProvider {
    /**
     * Creates new properties data provider for .env, .ini, and .properties config files.
     */
    constructor() {
        // TODO: add mime types later for http data loading
        this.supportedDataFileTypes = ['.env', '.ini', '.properties'];
        this.logger = new logger_1.Logger('properties.data.provider:', config.logLevel);
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
            // TODO: add mime types later for remote http data loading
            const dataFileType = dataUrl.substr(dataUrl.lastIndexOf('.')); // file extension
            try {
                // read and parse properties file type data
                let content = String(yield fileUtils.readDataFile(dataUrl, 'utf8'));
                data = props.parse(content, this.getDataParseOptions(dataFileType));
            }
            catch (error) {
                this.logger.logMessage(logger_1.LogLevel.Error, `getData(): Error parsing '${dataUrl}' \n\t Error:`, error.message);
                vscode_1.window.showErrorMessage(`Unable to parse data file: '${dataUrl}'. \n\t Error: ${error.message}`);
            }
            loadData(jsonUtils.convertJsonData(data));
        });
    }
    /**
     * Gets data provider parse options for the specified data file type.
     * @param dataFileType Data file type.
     */
    getDataParseOptions(dataFileType) {
        let dataParseOptions = null; // default
        switch (dataFileType) {
            case '.env':
                dataParseOptions = { sections: true, comments: ['#'] };
                break;
            case '.ini':
                // NOTE: some INI files consider # as a comment
                dataParseOptions = { sections: true, comments: [';', '#'] };
                break;
            case '.properties':
                dataParseOptions = { sections: true };
                break;
        }
        return dataParseOptions;
    }
    /**
     * Gets data table names for data sources with multiple data sets.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataTableNames(dataUrl) {
        return []; // none for properties data files
    }
    /**
     * Gets data schema in json format for file types that provide it.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataSchema(dataUrl) {
        // TODO: auto-gen json schema ???
        return null; // none for properties data files
    }
    /**
     * Saves .properties data.
     * @param filePath Local data file path.
     * @param fileData Raw data to save.
     * @param tableName Table name for data files with multiple tables support.
     * @param showData Show saved data callback.
     */
    saveData(filePath, fileData, tableName, showData) {
        // check if data is from Properties Grid Data View
        if (fileData.length > 0 && fileData[0].hasOwnProperty('key') && fileData[0].hasOwnProperty('value')) {
            let propertiesString = '';
            const newLineRegExp = new RegExp('\n', 'g');
            fileData = fileData.forEach(property => {
                // convert it to properties string
                let propertyLine = `${property['key']}=${property['value']}`;
                if (propertyLine.indexOf(`\n`) > 0) {
                    // replace all new lines for multi-line property values with \ next line marker and \n
                    propertyLine = propertyLine.replace(newLineRegExp, '\\\n');
                }
                propertiesString += `${propertyLine}\n`;
            });
            fileData = propertiesString;
        }
        else {
            // display not a properties collection warning
            fileData = '';
            vscode_1.window.showWarningMessage(`Data loaded in Preview is not a Properties collection. Use other data formats to Save this data.`);
        }
        if (fileData.length > 0) {
            // TODO: change this to async later
            fs.writeFile(filePath, fileData, (error) => showData(error));
        }
    } // end of saveData()
}
exports.PropertiesDataProvider = PropertiesDataProvider;
//# sourceMappingURL=properties.data.provider.js.map