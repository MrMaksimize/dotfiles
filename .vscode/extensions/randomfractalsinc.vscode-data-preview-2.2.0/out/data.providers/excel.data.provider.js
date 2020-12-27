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
exports.ExcelDataProvider = void 0;
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const config = require("../config");
const fileUtils = require("../utils/file.utils");
const logger_1 = require("../logger");
/**
 * Excel data provider.
 */
class ExcelDataProvider {
    /**
     * Creates data provider for Excel data files.
     */
    constructor() {
        // TODO: add mime types later for http data loading
        this.supportedDataFileTypes = ['.dif', '.ods', '.xls', '.xlsb', '.xlsm', '.xlsx', '.xml', '.html'];
        this.logger = new logger_1.Logger('excel.data.provider:', config.logLevel);
        // local table names cache with dataUrl/tableNames array key/values
        this.dataTableNamesMap = {};
        this.logger.debug('created for:', this.supportedDataFileTypes);
    }
    /**
     * Gets local or remote Excel file data.
     * @param dataUrl Local data file path or remote data url.
     * @param parseOptions Data parse options.
     * @param loadData Load data callback.
     */
    getData(dataUrl, parseOptions, loadData) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataFileName = path.basename(dataUrl);
            const dataFileType = dataUrl.substr(dataUrl.lastIndexOf('.')); // file extension
            // read Excel file data
            yield fileUtils.readDataFile(dataUrl, null).then((dataBuffer) => {
                // create Excel 'workbook'
                const workbook = xlsx.read(dataBuffer, {
                    cellDates: true,
                });
                // load data sheets
                let dataRows = [];
                this.dataTableNamesMap[dataUrl] = [];
                if (workbook.SheetNames.length > 0) {
                    if (workbook.SheetNames.length > 1) {
                        // cache sheet names
                        this.dataTableNamesMap[dataUrl] = workbook.SheetNames;
                        this.logger.debug(`getData(): file: ${dataFileName} sheetNames:`, workbook.SheetNames);
                    }
                    // determine spreadsheet to load
                    let sheetName = workbook.SheetNames[0];
                    if (parseOptions.dataTable.length > 0 &&
                        workbook.SheetNames.indexOf(parseOptions.dataTable) >= 0) {
                        // reset to requested table name
                        sheetName = parseOptions.dataTable;
                    }
                    // get worksheet data row objects array
                    const worksheet = workbook.Sheets[sheetName];
                    dataRows = xlsx.utils.sheet_to_json(worksheet);
                    // create json data file for binary Excel file text data preview
                    if (parseOptions.createJsonFiles && config.supportedBinaryDataFiles.test(dataFileName)) {
                        // create json data file path
                        let jsonFilePath = dataUrl.replace(dataFileType, '.json');
                        if (parseOptions.dataTable.length > 0 && workbook.SheetNames.length > 1) {
                            // append table name to the generated json data file name
                            jsonFilePath = jsonFilePath.replace('.json', `-${parseOptions.dataTable}.json`);
                        }
                        if (!fs.existsSync(jsonFilePath)) {
                            fileUtils.createJsonFile(jsonFilePath, dataRows);
                        }
                    }
                }
                loadData(dataRows);
            });
        });
    } // end of getData()
    /**
     * Gets data table names for data sources with multiple data sets.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataTableNames(dataUrl) {
        return this.dataTableNamesMap[dataUrl];
    }
    /**
     * Gets data schema in json format for file types that provide it.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataSchema(dataUrl) {
        // TODO: return headers row for Excel data ???
        return null; // none for Excel data files
    }
    /**
     * Saves JSON data in Excel format for html, ods, xml, xlsb and xlsx file types.
     * @param filePath Local data file path.
     * @param fileData Raw data to save.
     * @param tableName Table name for data files with multiple tables support.
     * @param showData Show saved data callback.
     */
    saveData(filePath, fileData, tableName, showData) {
        const fileType = filePath.substr(filePath.lastIndexOf('.'));
        fileData = this.jsonToExcelData(fileData, fileType, tableName);
        if (fileData.length > 0) {
            // TODO: change this to async later
            fs.writeFile(filePath, fileData, (error) => showData(error));
        }
    }
    /**
     * Converts JSON data to Excel data formats.
     * @param jsonData Json data to convert.
     * @param bookType Excel data file/book type.
     */
    jsonToExcelData(jsonData, fileType, tableName) {
        this.logger.debug('jsonToExcelData(): creating excel data:', fileType);
        // create new workbook
        const workbook = xlsx.utils.book_new();
        // convert json data to worksheet format
        const worksheet = xlsx.utils.json_to_sheet(jsonData, {
        //header: JSON.parse(this._viewConfig.columns)
        });
        // append worksheet to workbook
        xlsx.utils.book_append_sheet(workbook, worksheet, tableName);
        // get text data string or binary spreadsheet data buffer
        let data = '';
        if (fileType === 'html' || fileType === 'xml') {
            data = xlsx.write(workbook, {
                type: 'string',
                compression: false,
                bookType: this.getBookType(fileType)
            });
        }
        else {
            data = xlsx.write(workbook, {
                type: 'buffer',
                compression: true,
                bookType: this.getBookType(fileType)
            });
        }
        return data;
    }
    /**
     * Converts file type to Excel book type.
     * @param fileType File type: .html, .ods, .xml, .xlsb, .xlsx, etc.
     */
    getBookType(fileType) {
        let bookType = 'xlsb'; // default
        // TODO: must be a better way to do this string to type conversion :)
        switch (fileType) {
            case '.html':
                bookType = 'html';
                break;
            case '.ods':
                bookType = 'ods';
                break;
            case '.xml':
                bookType = 'xlml';
                break;
            case '.xlsb':
                bookType = 'xlsb';
                break;
            case '.xlsx':
                bookType = 'xlsx';
                break;
        }
        return bookType;
    }
}
exports.ExcelDataProvider = ExcelDataProvider;
//# sourceMappingURL=excel.data.provider.js.map