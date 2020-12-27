"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvroDataProvider = void 0;
const fs = require("fs");
const avro = require("avsc");
const config = require("../config");
const fileUtils = require("../utils/file.utils");
const jsonUtils = require("../utils/json.utils");
const logger_1 = require("../logger");
/**
 * Avro data provider.
 */
class AvroDataProvider {
    /**
     * Creates data provider for Avro data files.
     */
    constructor() {
        // TODO: add mime types later for http data loading
        this.supportedDataFileTypes = ['.avro'];
        this.logger = new logger_1.Logger('avro.data.provider:', config.logLevel);
        this.logger.debug('created for:', this.supportedDataFileTypes);
    }
    /**
     * Gets local or remote Avro file data.
     * @param dataUrl Local data file path or remote data url.
     * @param parseOptions Data parse options.
     * @param loadData Load data callback.
     */
    getData(dataUrl, parseOptions, loadData) {
        let dataRows = [];
        const dataBlockDecoder = avro.createFileDecoder(dataUrl);
        dataBlockDecoder.on('metadata', (dataSchema) => {
            this.logger.debug('metadata', dataSchema);
            // create schema.json file for Avro metadata preview
            const dataSchemaFilePath = dataUrl.replace('.avro', '.schema.json');
            if (parseOptions.createJsonSchema && !fs.existsSync(dataSchemaFilePath)) {
                fileUtils.createJsonFile(dataSchemaFilePath, dataSchema);
            }
        });
        dataBlockDecoder.on('data', (data) => dataRows.push(data));
        dataBlockDecoder.on('end', () => {
            // create data json file for Avro text data preview
            const jsonFilePath = dataUrl.replace('.avro', '.json');
            if (parseOptions.createJsonFiles && !fs.existsSync(jsonFilePath)) {
                fileUtils.createJsonFile(jsonFilePath, dataRows);
            }
            // Note: flatten data rows for now since Avro format has hierarchical data structure
            dataRows = dataRows.map(rowObject => jsonUtils.flattenObject(rowObject));
            loadData(dataRows);
        });
    } // end of getData()
    /**
     * Gets data table names for data sources with multiple data sets.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataTableNames(dataUrl) {
        return []; // none for Avro data for now
    }
    /**
     * Gets data schema in json format for file types that provide it.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataSchema(dataUrl) {
        // TODO: convert avro metadata to data view schema
        return null; // none for avro data files
    }
    /**
     * Saves Avro data.
     * @param filePath Local data file path.
     * @param fileData Raw data to save.
     * @param tableName Table name for data files with multiple tables support.
     * @param showData Show saved data callback.
     */
    saveData(filePath, fileData, tableName, showData) {
        // TODO
    }
}
exports.AvroDataProvider = AvroDataProvider;
//# sourceMappingURL=avro.data.provider.js.map