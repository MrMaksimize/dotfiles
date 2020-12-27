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
exports.ArrowDataProvider = void 0;
const fs = require("fs");
const apache_arrow_1 = require("apache-arrow");
const config = require("../config");
const fileUtils = require("../utils/file.utils");
const logger_1 = require("../logger");
/**
 * Arrow data provider.
 */
class ArrowDataProvider {
    /**
     * Creates data provider for Apache Arrow data files.
     * @see https://arrow.apache.org/ for more info.
     */
    constructor() {
        // TODO: add mime types later for http data loading
        this.supportedDataFileTypes = ['.arr', '.arrow'];
        // local Arrow data view schema cache with dataUrl/schema key/mapping entries
        this.dataSchemaMap = {};
        this.logger = new logger_1.Logger('arrow.data.provider:', config.logLevel);
        this.logger.debug('created for:', this.supportedDataFileTypes);
    }
    /**
     * Gets local or remote binary Arrow file data.
     * @param dataUrl Local data file path or remote data url.
     * @param parseOptions Data parse options.
     * @param loadData Load data callback.
     */
    getData(dataUrl, parseOptions, loadData) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataFileType = dataUrl.substr(dataUrl.lastIndexOf('.')); // file extension
            // read binary Arrow data
            yield fileUtils.readDataFile(dataUrl, null).then((dataBuffer) => {
                // create typed data array
                const dataArray = new Uint8Array(dataBuffer);
                this.logger.debug('getData(): data size in bytes:', dataArray.byteLength.toLocaleString());
                // create arrow table
                const dataTable = apache_arrow_1.Table.from(dataArray);
                // remap arrow data schema to columns for data viewer
                const dataSchema = {};
                dataTable.schema.fields.map(field => {
                    let fieldType = field.type.toString();
                    const typesIndex = fieldType.indexOf('<');
                    if (typesIndex > 0) {
                        fieldType = fieldType.substring(0, typesIndex);
                    }
                    dataSchema[field.name] = config.dataTypes[fieldType];
                });
                // cache arrow data view schema
                this.dataSchemaMap[dataUrl] = dataSchema;
                // create Arrow schema.json file for data schema text data preview
                const dataSchemaFilePath = dataUrl.replace(dataFileType, '.schema.json');
                if (parseOptions.createJsonSchema && !fs.existsSync(dataSchemaFilePath)) {
                    fileUtils.createJsonFile(dataSchemaFilePath, dataTable.schema);
                }
                // create arrow data.json for text arrow data preview
                let dataRows = [];
                const jsonFilePath = dataUrl.replace(dataFileType, '.json');
                if (parseOptions.createJsonFiles && !fs.existsSync(jsonFilePath)) {
                    // convert arrow table data to array of objects (happens only on the 1st run :)
                    dataRows = Array(dataTable.length);
                    const fields = dataTable.schema.fields.map(field => field.name);
                    for (let i = 0, n = dataRows.length; i < n; ++i) {
                        const proto = {};
                        fields.forEach((fieldName, index) => {
                            const column = dataTable.getColumnAt(index);
                            proto[fieldName] = column.get(i);
                        });
                        dataRows[i] = proto;
                    }
                    fileUtils.createJsonFile(jsonFilePath, dataRows);
                }
                loadData(dataArray);
            });
        });
    } // end of getData()
    /**
     * Gets data table names for data sources with multiple data sets.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataTableNames(dataUrl) {
        return []; // none for Arrow data for now
    }
    /**
     * Gets data schema in json format for file types that provide it.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataSchema(dataUrl) {
        return this.dataSchemaMap[dataUrl];
    }
    /**
     * Saves Arrow data.
     * @param filePath Local data file path.
     * @param fileData Raw data to save.
     * @param tableName Table name for data files with multiple tables support.
     * @param showData Show saved data callback.
     */
    saveData(filePath, fileData, tableName, showData) {
        fileData = Buffer.from(fileData);
        this.logger.debug('saveData(): arrow data size in bytes:', fileData.byteLength.toLocaleString());
        if (fileData.length > 0) {
            // TODO: change this to async later
            fs.writeFile(filePath, fileData, (error) => showData(error));
        }
    }
}
exports.ArrowDataProvider = ArrowDataProvider;
//# sourceMappingURL=arrow.data.provider.js.map