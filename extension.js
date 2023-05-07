const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const clipboardy = require('clipboardy');

function getFiles(dirPath, filesArr) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.vscode') {
                getFiles(filePath, filesArr);
            }
        } else {
            const ext = path.extname(file);
            const base = path.basename(file);

            const ignoredExtensions = ['.log', '.cache', '.DS_Store'];
            const ignoredFiles = ['package.json', 'package-lock.json', 'yarn.lock'];

            if (!ignoredExtensions.includes(ext) && !ignoredFiles.includes(base)) {
                filesArr.push(filePath);
            }
        }
    });

    return filesArr;
}

function copyFilesToClipboard() {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const files = getFiles(rootPath, []);
    let clipboardContent = '';

    files.forEach((file) => {
        const relativePath = path.relative(rootPath, file);
        const fileContent = fs.readFileSync(file, 'utf-8');
        clipboardContent += `file-name: ${relativePath}\nfile_contents:\n${fileContent}\n\n`;
    });

    clipboardy.writeSync(clipboardContent);
    vscode.window.showInformationMessage('Copied file names and contents to clipboard');
}

function activate(context) {
    const disposable = vscode.commands.registerCommand('copyFilesToClipboard', copyFilesToClipboard);
    context.subscriptions.push(disposable);
}

exports.activate = activate;

function deactivate() {}

exports.deactivate = deactivate;
