// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TasksProvider } from './dataProvider/taskProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('scriptrunner.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from scriptrunner!');
	});

	// vscode.window.createTreeView

	let taskProvider= new TasksProvider(context);
	vscode.window.registerTreeDataProvider('task-list', taskProvider);

	vscode.commands.registerCommand('task-list.refresh', () => taskProvider.refresh());
	vscode.commands.registerCommand('task-list.ignore', (context) => taskProvider.ignore(context));
	vscode.commands.registerCommand('task-list.execute', (context) => taskProvider.execute(context));

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
