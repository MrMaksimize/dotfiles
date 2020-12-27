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
exports.MarkdownDataProvider = void 0;
const fs = require("fs");
const config = require("../config");
const fileUtils = require("../utils/file.utils");
const logger_1 = require("../logger");
const vscode_1 = require("vscode");
/**
 * Markdown tables data provider.
 */
class MarkdownDataProvider {
    /**
     * Creates data provider for Excel data files.
     */
    constructor() {
        // TODO: add mime types later for http data loading
        this.supportedDataFileTypes = ['.md'];
        this.logger = new logger_1.Logger('markdown.data.provider:', config.logLevel);
        // local table names cache with dataUrl/tableNames array key/values
        this.dataTableNamesMap = {};
        this.logger.debug('created for:', this.supportedDataFileTypes);
    }
    /**
     * Gets local or remote markdown file table data.
     * @param dataUrl Local data file path or remote data url.
     * @param parseOptions Data parse options.
     * @param loadData Load data callback.
     */
    getData(dataUrl, parseOptions, loadData) {
        return __awaiter(this, void 0, void 0, function* () {
            let content = '';
            try {
                // read markdown file content
                content = String(yield fileUtils.readDataFile(dataUrl, 'utf8'));
                // convert it to to CSV for loading into data view
                content = this.markdownToCsv(dataUrl, content, parseOptions.dataTable);
            }
            catch (error) {
                this.logger.error(`getMarkdownData(): Error parsing '${dataUrl}'. \n\t Error: ${error.message}`);
                vscode_1.window.showErrorMessage(`Unable to parse data file: '${dataUrl}'. \n\t Error: ${error.message}`);
            }
            loadData(content);
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
        // TODO: return md table headers row later ???
        return null; // none for .md data files
    }
    /**
     * Saves CSV as markdown table data.
     * @param filePath Local data file path.
     * @param fileData Raw data to save.
     * @param tableName Table name for data files with multiple tables support.
     * @param showData Show saved data callback.
     */
    saveData(filePath, fileData, tableName, showData) {
        // convert CSV text to markdown table
        fileData = this.csvToMarkdownTable(fileData);
        if (fileData.length > 0) {
            // TODO: change this to async later
            fs.writeFile(filePath, fileData, (error) => showData(error));
        }
    }
    /**
     * Converts markdown content to csv data for display in data view.
     * @param dataUrl Local data file path or remote data url.
     * @param markdownContent Markdown file content to convert to csv string.
     * @param dataTable Markdown data table name to load.
     */
    markdownToCsv(dataUrl, markdownContent, dataTable) {
        // extract markdown sections and tables
        const sections = markdownContent.split('\n#');
        const sectionMarker = new RegExp(/(#)/g);
        const quotes = new RegExp(/(")/g);
        const tableHeaderSeparator = new RegExp(/((\|)|(\:)|(\-)|(\s))+/g);
        const tableRowMarkdown = new RegExp(/((\|[^|\r\n]*)+\|(\r?\n|\r)?)/g);
        const tablesMap = {};
        let tableNames = [];
        sections.forEach(section => {
            // get section title
            let sectionTitle = '';
            const sectionLines = section.split('\n');
            if (sectionLines.length > 0) {
                sectionTitle = sectionLines[0].replace(sectionMarker, '').trim(); // strip out #'s and trim
            }
            // create section text blocks
            const textBlocks = [];
            let textBlock = '';
            sectionLines.forEach(textLine => {
                if (textLine.trim().length === 0) {
                    // create new text block
                    textBlocks.push(textBlock);
                    textBlock = '';
                }
                else {
                    // append to the current text block
                    textBlock += textLine + '\n';
                }
            });
            // extract section table data from each section text block
            const tables = []; // two-dimensional array of table rows
            textBlocks.forEach(textBlock => {
                // extract markdown table data rows from a text block
                const tableRows = textBlock.match(tableRowMarkdown);
                if (tableRows) {
                    // add matching markdown table rows to the tables array
                    tables.push(tableRows);
                    this.logger.debug('markdownToCsv(): section:', sectionTitle);
                    this.logger.debug('markdownToCsv(): extractred markdown table rows:', tableRows);
                }
            });
            // process markdown tables
            tables.forEach((table, tableIndex) => {
                // process markdown table row strings
                const tableRows = [];
                table.forEach(row => {
                    // trim markdown table text row lines
                    row = row.trim();
                    // strip out leading | table row sign
                    if (row.startsWith('| ')) {
                        row = row.slice(2);
                    }
                    // strip out trailing | table row sign
                    if (row.endsWith(' |')) {
                        row = row.slice(0, row.length - 2);
                    }
                    // check for a table header separator row
                    const isTableHeaderSeparator = (row.replace(tableHeaderSeparator, '').length === 0);
                    if (!isTableHeaderSeparator && row.length > 0) {
                        // add data table row
                        tableRows.push(row);
                    }
                });
                if (tableRows.length > 0) {
                    // create table title
                    let tableTitle = sectionTitle;
                    if (tables.length > 1) {
                        // append table index
                        tableTitle += '-table-' + (tableIndex + 1);
                    }
                    // update table list for data view display
                    tablesMap[tableTitle] = tableRows;
                    tableNames.push(tableTitle);
                    this.logger.debug(`markdownToCsv(): created data table: '${tableTitle}' rows: ${tableRows.length}`);
                }
            }); // end of tables.forEach(row)
        }); // end of sections.forEach(textBlock/table)
        // get requested table data
        let table = tablesMap[tableNames[0]]; // default to 1st table in the loaded tables list
        if (dataTable && dataTable.length > 0) {
            table = tablesMap[dataTable];
            this.logger.debug(`markdownToCsv(): requested data table: '${dataTable}'`);
        }
        if (tableNames.length === 1) {
            // clear table names if only one markdown table is present
            tableNames = [];
        }
        // update table names cache
        this.dataTableNamesMap[dataUrl] = tableNames;
        // convert requested markdown table to csv for data view display
        let csvContent = '';
        if (table) {
            this.logger.debug('markdownToCsv(): markdown table rows:', table);
            table.forEach(row => {
                const cells = row.split(' | ');
                const csvCells = [];
                cells.forEach(cell => {
                    cell = cell.trim();
                    const cellHasQuotes = quotes.test(cell);
                    if (cellHasQuotes) {
                        // escape quotes for csv
                        cell = cell.replace(quotes, '""'); // double quote for csv quote escape
                    }
                    if (cellHasQuotes || cell.indexOf(',') >= 0) {
                        // quote cell string
                        cell = `"${cell}"`;
                    }
                    csvCells.push(cell);
                });
                const csvRow = csvCells.join(',');
                csvContent += csvRow + '\n';
            });
            this.logger.debug('markdownToCsv(): final csv table content string for data.view load:\n', csvContent);
        }
        return csvContent;
    } // end of markdownToCsv()
    /**
     * Converts CSV to markdown table.
     * @param {string} csvContent Csv/tsv data content.
     * @param {string} delimiter Csv/tsv delimiter.
     * @param {boolean} hasTableHeaderRow Has table header row.
     * @returns {string} Markdown table content.
     */
    csvToMarkdownTable(csvContent, delimiter = ',', hasTableHeaderRow = true) {
        if (delimiter !== '\t') {
            // replace all tabs with spaces
            csvContent = csvContent.replace(/\t/g, '    ');
        }
        // extract table rows and data from csv content
        const csvRows = csvContent.split('\n');
        const tableData = [];
        const maxColumnLength = []; // for pretty markdown table cell spacing
        const cellRegExp = new RegExp(delimiter + '(?![^"]*"\\B)');
        const doubleQuotes = new RegExp(/("")/g);
        this.logger.debug('csvToMarkdownTable(): csv rows:', csvRows);
        csvRows.forEach((row, rowIndex) => {
            if (typeof tableData[rowIndex] === 'undefined') {
                // create new table row cells data array
                tableData[rowIndex] = [];
            }
            // extract row cells data from csv text line
            const cells = row.replace('\r', '').split(cellRegExp);
            cells.forEach((cell, columnIndex) => {
                if (typeof maxColumnLength[columnIndex] === 'undefined') {
                    // set initial column size to 0
                    maxColumnLength[columnIndex] = 0;
                }
                // strip out leading and trailing quotes
                if (cell.startsWith('"')) {
                    cell = cell.substring(1);
                }
                if (cell.endsWith('"')) {
                    cell = cell.substring(0, cell.length - 1);
                }
                // replace escaped double quotes that come from csv text data format
                cell = cell.replace(doubleQuotes, '"');
                // update max column length for pretty markdwon table cells spacing
                maxColumnLength[columnIndex] = Math.max(maxColumnLength[columnIndex], cell.length);
                // save extracted cell data for table rows output
                tableData[rowIndex][columnIndex] = cell;
            });
        });
        // create markdown table header and separator text lines
        let tableHeader = '';
        let tableHeaderSeparator = '';
        maxColumnLength.forEach((columnLength) => {
            const columnHeader = Array(columnLength + 1 + 2);
            tableHeader += '|' + columnHeader.join(' ');
            tableHeaderSeparator += '|' + columnHeader.join('-');
        });
        // end table header and separator text lines
        tableHeader += '| \n';
        tableHeaderSeparator += '| \n';
        if (hasTableHeaderRow) {
            // reset: use table data instead
            tableHeader = '';
        }
        // create markdown table data text lines
        let tableRows = '';
        tableData.forEach((row, rowIndex) => {
            maxColumnLength.forEach((columnLength, columnIndex) => {
                const cellData = typeof row[columnIndex] === 'undefined' ? '' : row[columnIndex];
                const cellSpacing = Array((columnLength - cellData.length) + 1).join(' ');
                const cellString = `| ${cellData}${cellSpacing} `;
                if (hasTableHeaderRow && rowIndex === 0) {
                    tableHeader += cellString;
                }
                else {
                    tableRows += cellString;
                }
            });
            // end table header or data row text line
            if (hasTableHeaderRow && rowIndex === 0) {
                tableHeader += '| \n';
            }
            else {
                tableRows += '| \n';
            }
        });
        return `${tableHeader}${tableHeaderSeparator}${tableRows}`;
    } // end of csvToMarkdownTable()
}
exports.MarkdownDataProvider = MarkdownDataProvider;
//# sourceMappingURL=markdown.data.provider.js.map