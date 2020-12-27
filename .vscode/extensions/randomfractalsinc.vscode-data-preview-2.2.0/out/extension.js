"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const path = require("path");
const config = require("./config");
const logger_1 = require("./logger");
const data_preview_1 = require("./data.preview");
const preview_manager_1 = require("./preview.manager");
const template_manager_1 = require("./template.manager");
const logger = new logger_1.Logger('data.preview:', config.logLevel);
let status;
/**
 * Activates this extension per rules set in package.json.
 * @param context vscode extension context.
 * @see https://code.visualstudio.com/api/references/activation-events for more info.
 */
function activate(context) {
    const extensionPath = context.extensionPath;
    logger.debug('activate(): activating from extPath:', context.extensionPath);
    // initialize data preview webview panel html template
    const templateManager = new template_manager_1.TemplateManager(context.asAbsolutePath('web'));
    const dataViewTemplate = templateManager.getTemplate('data.view.html');
    // create extension status bar items
    status = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 300); // left align priority
    status.text = ''; // '🈸 Activated!';
    status.show();
    // register Data preview serializer for restore on vscode restart
    vscode_1.window.registerWebviewPanelSerializer('data.preview', new data_preview_1.DataPreviewSerializer('data.preview', extensionPath, dataViewTemplate, status));
    // add Preview Data command
    const dataWebview = createDataPreviewCommand('data.preview', 'data.preview', extensionPath, dataViewTemplate);
    context.subscriptions.push(dataWebview);
    // add Preview Data on Side command
    const dataWebviewOnSide = createDataPreviewCommand('data.preview.on.side', 'data.preview', extensionPath, dataViewTemplate);
    context.subscriptions.push(dataWebviewOnSide);
    // add Preview Remote data command
    const dataWebviewRemote = vscode_1.commands.registerCommand('data.preview.remote', () => {
        vscode_1.window.showInputBox({
            ignoreFocusOut: true,
            placeHolder: 'https://',
            prompt: 'Enter remote data url'
        }).then((dataUrl) => {
            if (dataUrl && dataUrl !== undefined && dataUrl.length > 0) {
                const dataUri = vscode_1.Uri.parse(dataUrl);
                // launch new data preview
                vscode_1.commands.executeCommand('data.preview', dataUri);
            }
        });
    });
    context.subscriptions.push(dataWebviewRemote);
    // refresh associated preview on data file save
    vscode_1.workspace.onDidSaveTextDocument((document) => {
        if (isDataFile(document)) {
            const dataUri = document.uri; // .with({scheme: 'data'});
            const previews = preview_manager_1.previewManager.find(dataUri);
            previews.forEach(preview => preview.refresh());
        }
    });
    // reset associated preview on data file change
    vscode_1.workspace.onDidChangeTextDocument((changeEvent) => {
        if (isDataFile(changeEvent.document)) {
            const dataUri = changeEvent.document.uri; //.with({scheme: 'data'});
            const previews = preview_manager_1.previewManager.find(dataUri);
            if (previews && changeEvent.contentChanges.length > 0) {
                // TODO: add refresh interval before enabling this
                // previews.forEach(preview => preview.refresh());
            }
        }
    });
    // reset all previews on config change
    vscode_1.workspace.onDidChangeConfiguration(() => {
        preview_manager_1.previewManager.configure();
    });
    logger.debug('activate(): activated! extPath:', context.extensionPath);
} // end of activate()
exports.activate = activate;
/**
 * Deactivates this vscode extension to free up resources.
 */
function deactivate() {
    status.text = '';
    status.hide();
    // add other extension cleanup code here, if needed
}
exports.deactivate = deactivate;
/**
 * Creates a data preview command.
 * @param commandType Preview Data command type: data.preview || data.preview.on.side for now.
 * @param viewType Preview Data view type: only data.preview for now. might add maps & help later.
 * @param extensionPath Extension path for loading scripts, styles, images and data templates.
 * @param viewTemplate Preview html template.
 */
function createDataPreviewCommand(commandType, viewType, extensionPath, viewTemplate) {
    const dataWebview = vscode_1.commands.registerCommand(commandType, (uri) => {
        let resource = uri;
        let viewColumn = getViewColumn();
        if (commandType.endsWith('.on.side')) {
            // bump view column
            viewColumn++;
        }
        if (!(resource instanceof vscode_1.Uri)) {
            if (vscode_1.window.activeTextEditor) {
                resource = vscode_1.window.activeTextEditor.document.uri;
            }
            else {
                vscode_1.window.showInformationMessage('Open a Data file to Preview.');
                return;
            }
        }
        const preview = new data_preview_1.DataPreview(viewType, extensionPath, resource, '', // default data table
        {}, // data view config
        {}, // other data views
        viewColumn, viewTemplate);
        preview.status = status;
        preview_manager_1.previewManager.add(preview);
        return preview.webview;
    });
    return dataWebview;
}
/**
 * Checks if the vscode text document is a data file.
 * @param document The vscode text document to check.
 */
function isDataFile(document) {
    const fileName = path.basename(document.uri.fsPath);
    logger.debug('isDataFile(): document:', document);
    logger.debug('isDataFile(): file:', fileName);
    return config.supportedDataFiles.test(fileName);
}
/**
 * Gets active editor view column for data preview display.
 */
function getViewColumn() {
    const activeEditor = vscode_1.window.activeTextEditor;
    return activeEditor ? (activeEditor.viewColumn) : vscode_1.ViewColumn.One;
}
//# sourceMappingURL=extension.js.map