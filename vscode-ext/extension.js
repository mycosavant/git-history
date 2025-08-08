const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const getCommits = require("./git");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension.git-file-history",
    function() {
      // The code you place here will be executed every time your command is executed
      try {
        const currentPath = getCurrentPath();
        if (!currentPath) {
          vscode.window.showInformationMessage("No active file");
          return;
        }

        const panel = vscode.window.createWebviewPanel(
          "gfh",
          `${path.basename(currentPath)} (Git History)`,
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
              vscode.Uri.file(path.join(context.extensionPath, "site"))
            ]
          }
        );
        
        // Add Content Security Policy for security
        const nonce = getNonce();
        const indexPath = path.join(
          context.extensionPath,
          "site",
          "index.html"
        );

        const index = fs.readFileSync(indexPath, "utf-8");
        const baseUri = panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, "site"))
        );
        const newIndex = index
          .replace(
            "<head>",
            `<head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${panel.webview.cspSource}; font-src ${panel.webview.cspSource}; img-src ${panel.webview.cspSource} data:;"><base href="${baseUri}/"/>`
          )
          .replace(
            "<body>",
            `<body><script nonce="${nonce}">/*<!--*/window.vscode=acquireVsCodeApi();window._PATH=${JSON.stringify(
              currentPath
            )}/*-->*/</script>`
          );

        panel.webview.html = newIndex;

        panel.webview.onDidReceiveMessage(
          async message => {
            try {
              switch (message.command) {
                case "commits":
                  const { path: filePath, last = 15, before = null } = message.params;
                  
                  // Validate inputs for security
                  if (!filePath || typeof filePath !== 'string') {
                    throw new Error('Invalid file path');
                  }
                  
                  const maxCommits = Math.min(Math.max(1, parseInt(last) || 15), 100);
                  
                  const commits = await getCommits(filePath, maxCommits, before);
                  panel.webview.postMessage(commits);
                  break;
                  
                default:
                  console.warn('Unknown command:', message.command);
              }
            } catch (error) {
              console.error('Error handling webview message:', error);
              vscode.window.showErrorMessage(`Git History Error: ${error.message}`);
            }
          },
          undefined,
          context.subscriptions
        );
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
  );

  context.subscriptions.push(disposable);
}

function getCurrentPath() {
  return (
    vscode.window.activeTextEditor &&
    vscode.window.activeTextEditor.document &&
    vscode.window.activeTextEditor.document.fileName
  );
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
