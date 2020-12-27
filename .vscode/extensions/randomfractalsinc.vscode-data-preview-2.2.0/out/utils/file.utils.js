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
exports.createJsonFile = exports.formatBytes = exports.getFileSize = exports.isRemoteDataUrl = exports.readDataFile = void 0;
const fs = require("fs");
const util = require("util");
const superagent = require("superagent");
const path = require("path");
const config = require("../config");
const logger_1 = require("../logger");
const vscode_1 = require("vscode");
const readFileAsync = util.promisify(fs.readFile);
const fileSizeLabels = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const logger = new logger_1.Logger(`file.utils:`, config.logLevel);
/**
 * Reads local data file or fetches public data source data.
 * @param dataFilePath Data file path or public data source url.
 * @param encoding Data file encoding: 'utf8' for text data files, null for binary data reads.
 */
function readDataFile(dataFilePath, encoding = null) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = '';
        const fileName = path.basename(dataFilePath);
        const fileUri = vscode_1.Uri.file(dataFilePath); // .parse(dataFilePath);
        const isRemoteData = isRemoteDataUrl(dataFilePath);
        logger.debug('readDataFile():', dataFilePath);
        if (!isRemoteData && !config.supportedDataFiles.test(fileName)) {
            vscode_1.window.showErrorMessage(`${dataFilePath} is not a supported data file for Data Preview!`);
        }
        else if (isRemoteData) {
            data = yield readRemoteData(dataFilePath, encoding);
        }
        else if (fs.existsSync(fileUri.fsPath)) {
            // read local data file via fs.readFile() api
            data = yield readLocalData(fileUri.fsPath, encoding);
        }
        else {
            // try to find requested data file(s) in open workspace
            vscode_1.workspace.findFiles(`**/${dataFilePath}`).then(files => {
                if (files.length > 0 && fs.existsSync(files[0].fsPath)) {
                    // read workspace file data
                    data = readLocalData(files[0].fsPath, encoding);
                }
                else {
                    vscode_1.window.showErrorMessage(`${dataFilePath} file doesn't exist!`);
                }
            });
        }
        return data;
    });
}
exports.readDataFile = readDataFile;
/**
 * Checks if the requested data url is a remote data source; http(s) only for now.
 * @param dataUrl The data url to check.
 * @returns True if the specified data url is a remote data source. false otherwise.
 */
function isRemoteDataUrl(dataUrl) {
    return dataUrl.startsWith('http://') || dataUrl.startsWith('https://');
}
exports.isRemoteDataUrl = isRemoteDataUrl;
/**
 * Gets local data file size for status display.
 * @param dataFilePath Data file path to get size stats for.
 */
function getFileSize(dataFilePath) {
    let fileSize = -1;
    const fileUri = vscode_1.Uri.file(dataFilePath); //.parse(dataFilePath);
    if (fs.existsSync(fileUri.fsPath)) {
        const stats = fs.statSync(fileUri.fsPath);
        fileSize = stats.size;
    }
    return fileSize;
}
exports.getFileSize = getFileSize;
/**
 * Formats bytes for file size status display.
 * @param bytes File size in bytes.
 * @param decimals Number of decimals to include.
 */
function formatBytes(bytes, decimals) {
    const base = 1024;
    let remainder = bytes;
    for (var i = 0; remainder > base; i++) {
        remainder /= base;
    }
    return `${parseFloat(remainder.toFixed(decimals))} ${fileSizeLabels[i]}`;
}
exports.formatBytes = formatBytes;
/**
 * Creates JSON data or schema.json file.
 * @param jsonFilePath Json file path.
 * @param jsonData Json file data.
 */
function createJsonFile(jsonFilePath, jsonData) {
    if (!fs.existsSync(jsonFilePath)) {
        const jsonString = JSON.stringify(jsonData, null, 2);
        try {
            // TODO: rework this to async file write later
            const jsonFileWriteStream = fs.createWriteStream(jsonFilePath, { encoding: 'utf8' });
            jsonFileWriteStream.write(jsonString);
            jsonFileWriteStream.end();
            logger.debug('createJsonFile(): saved:', jsonFilePath);
        }
        catch (error) {
            const errorMessage = `Failed to save file: ${jsonFilePath}`;
            logger.logMessage(logger_1.LogLevel.Error, 'crateJsonFile():', errorMessage);
            vscode_1.window.showErrorMessage(errorMessage);
        }
    }
}
exports.createJsonFile = createJsonFile;
/**
 * Reads local file data.
 * @param dataFilePath Data file path.
 * @param encoding Data file encoding: 'utf8' for text data files, null for binary data reads.
 */
function readLocalData(dataFilePath, encoding = null) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('readLocalData():', dataFilePath);
        // read local data file via fs read file api
        return yield readFileAsync(dataFilePath, encoding);
    });
}
/**
 * Reads remote file data.
 * @param dataUrl Data file url.
 * @param encoding Data file encoding: 'utf8' for text data files, null for binary data reads.
 */
function readRemoteData(dataUrl, encoding = null) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('readRemoteData(): url:', dataUrl);
        if (encoding) { // must be text request
            return yield superagent.get(dataUrl).then(response => response.text);
        }
        else { // binary data request
            return yield superagent.get(dataUrl)
                .buffer(true).parse(superagent.parse.image)
                .then(response => response.body);
        }
    });
}
//# sourceMappingURL=file.utils.js.map