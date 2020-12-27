"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataManager = exports.DataManager = void 0;
const path = require("path");
const config = require("./config");
const logger_1 = require("./logger");
// data provider imports
const avro_data_provider_1 = require("./data.providers/avro.data.provider");
const arrow_data_provider_1 = require("./data.providers/arrow.data.provider");
const excel_data_provider_1 = require("./data.providers/excel.data.provider");
const hjson_data_provider_1 = require("./data.providers/hjson.data.provider");
const json_data_provider_1 = require("./data.providers/json.data.provider");
const json5_data_provider_1 = require("./data.providers/json5.data.provider");
const json_line_data_provider_1 = require("./data.providers/json.line.data.provider");
const markdown_data_provider_1 = require("./data.providers/markdown.data.provider");
const text_data_provider_1 = require("./data.providers/text.data.provider");
const properties_data_provider_1 = require("./data.providers/properties.data.provider");
const yaml_data_provider_1 = require("./data.providers/yaml.data.provider");
/**
 * IDataManager implementation.
 * TODO: make this pluggable via data.preview.data.manager setting later.
 */
class DataManager {
    /**
     * Creates new data manager instance and loads IDataProvider's
     * for the supported data formats listed in package.json.
     */
    constructor() {
        this._logger = new logger_1.Logger('data.manager:', config.logLevel);
        this._dataProviders = this.loadDataProviders();
    }
    /**
     * Creates data manager singleton instance.
     */
    static get Instance() {
        if (!this._instance) {
            this._instance = new this();
        }
        return this._instance;
    }
    /**
     * Initializes data providers for the supported data formats.
     * @see package.json and config.ts for more info.
     */
    loadDataProviders() {
        this._logger.debug('loadDataProviders(): loading data providers...');
        // create data provider instances for the supported data formats
        const dataProviders = new Map();
        this.addDataProvider(dataProviders, new avro_data_provider_1.AvroDataProvider());
        this.addDataProvider(dataProviders, new arrow_data_provider_1.ArrowDataProvider());
        this.addDataProvider(dataProviders, new excel_data_provider_1.ExcelDataProvider());
        this.addDataProvider(dataProviders, new hjson_data_provider_1.HjsonDataProvider());
        this.addDataProvider(dataProviders, new json_data_provider_1.JsonDataProvider());
        this.addDataProvider(dataProviders, new json5_data_provider_1.Json5DataProvider());
        this.addDataProvider(dataProviders, new json_line_data_provider_1.JsonLineDataProvider());
        this.addDataProvider(dataProviders, new markdown_data_provider_1.MarkdownDataProvider());
        this.addDataProvider(dataProviders, new text_data_provider_1.TextDataProvider());
        this.addDataProvider(dataProviders, new properties_data_provider_1.PropertiesDataProvider());
        this.addDataProvider(dataProviders, new yaml_data_provider_1.YamlDataProvider());
        this._logger.debug('loadDataProviders(): loaded data providers:', Object.keys(dataProviders));
        return dataProviders;
    }
    /**
     * Adds new data provider to the provider/file types map.
     * @param dataProviderMap Data provider map to update.
     * @param dataProvider Data provider to add.
     */
    addDataProvider(dataProviderMap, dataProvider) {
        dataProvider.supportedDataFileTypes.forEach(fileType => {
            dataProviderMap.set(fileType, dataProvider);
        });
    }
    /**
     * Gets IDataProvider instance for the specified data url.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataProvider(dataUrl) {
        const fileName = path.basename(dataUrl);
        const fileType = path.extname(fileName); // file extension
        if (fileType.length > 0 && this._dataProviders.has(fileType)) {
            return this._dataProviders.get(fileType);
        }
        else if (this._dataProviders.has(fileName)) { // no file extension
            // for dockerfile, etc.
            return this._dataProviders.get(fileName);
        }
        return this._dataProviders.get('.json'); // default to json.data.provider for now
    }
    /**
     * Gets local or remote data.
     * @param dataUrl Local data file path or remote data url.
     * @param parseOptions Data parse options.
     * @param loadData Load data callback.
     */
    getData(dataUrl, parseOptions, loadData) {
        const dataProvider = this.getDataProvider(dataUrl);
        dataProvider.getData(dataUrl, parseOptions, loadData);
    }
    /**
     * Gets data table names for data sources with multiple data sets.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataTableNames(dataUrl) {
        const dataProvider = this.getDataProvider(dataUrl);
        return dataProvider.getDataTableNames(dataUrl);
    }
    /**
     * Gets data schema in json format for file types that provide it.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataSchema(dataUrl) {
        const dataProvider = this.getDataProvider(dataUrl);
        return dataProvider.getDataSchema(dataUrl);
    }
    /**
     * Saves raw data provider data.
     * @param filePath Local data file path.
     * @param fileData Raw data to save.
     * @param tableName Table name for data files with multiple tables support.
     * @param showData Show saved data callback.
     */
    saveData(filePath, fileData, tableName, showData) {
        const dataProvider = this.getDataProvider(filePath);
        dataProvider.saveData(filePath, fileData, tableName, showData);
    }
}
exports.DataManager = DataManager;
// export Data manager singleton
exports.dataManager = DataManager.Instance;
//# sourceMappingURL=data.manager.js.map