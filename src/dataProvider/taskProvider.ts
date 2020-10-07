import * as vscode from 'vscode';
import {TaskDescription} from '../models/TasksDescription';

export class TasksProvider implements vscode.TreeDataProvider<TaskDescription>{
    private _onDidChangeTreeData: vscode.EventEmitter<TaskDescription | null> = new vscode.EventEmitter<TaskDescription | null>();
	readonly onDidChangeTreeData: vscode.Event<TaskDescription | null> = this._onDidChangeTreeData.event;

	private autoRefresh: boolean | undefined = true;

	constructor(private context: vscode.ExtensionContext) {
		this.autoRefresh = vscode.workspace.getConfiguration('taskOutline').get('autorefresh');
	}

	refresh(): void {
		this._onDidChangeTreeData.fire(null);
    }
    
    ignore(context: any) :void {
        console.log(context.label);
    }

    async execute(context: TaskDescription) : Promise<void> {
        console.log(context.label);
        const command = context.fullCommand;
        const shell = new vscode.ShellExecution(command);

        const task = new vscode.Task({type: 'shell'}, vscode.TaskScope.Workspace, 'execute task', 'source', shell);
        await vscode.tasks.executeTask(task);
    }
    
    getTreeItem(element: TaskDescription): vscode.TreeItem {
       return element; 
    }

    getChildren(element?: TaskDescription): vscode.ProviderResult<TaskDescription[]> {
        
        return this.getScriptsAsync(vscode.workspace.workspaceFolders);
    }
    
    async getScriptsAsync(rootFolders: readonly vscode.WorkspaceFolder[] | undefined): Promise<TaskDescription[]>{

        // TODO: group by folder
        const files = await vscode.workspace.findFiles("**/*.{sh,bat,ps,ps1,py}").then((f: vscode.Uri[]) => f);
        const testfiles = await vscode.workspace.findFiles("**/*").then((f: vscode.Uri[]) =>
        {
            return f;
        });

        return files.map((f)=>
        {
            const description = new TaskDescription(f.path, undefined);

            return description;
        });
    }
}