import * as vscode from 'vscode';
import {TaskDescription, TaskFileDescription} from '../models/TasksDescription';
import * as meta from './fileHelpers';

export class CustomTasksProvider implements vscode.TreeDataProvider<TaskFileDescription>{
    onDidChangeTreeData?: vscode.Event<void | TaskFileDescription | null | undefined> | undefined;

    getTreeItem(element: TaskFileDescription): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: TaskFileDescription): vscode.ProviderResult<TaskFileDescription[]> {
        throw new Error('Method not implemented.');
    }

    async getTasks(context: TaskFileDescription){
        const filePath = meta.customTasksFile(context.file ?? "");
        const tasks = await meta.getDataFromFile(filePath[0]);

        return tasks.map(t =>{
            return new TaskFileDescription(t.name, "",  {
                        command:'task-list.edit',
                        title: 'edit',
                        arguments: [filePath[0].fsPath],
                        tooltip: 'Open the script file in file editor'},
                        t.execution);
        });
    }
}