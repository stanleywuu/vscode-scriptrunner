import * as vscode from 'vscode';
import {TaskDescription, TaskFileDescription} from '../models/TasksDescription';

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

    async execute(context: TaskFileDescription) : Promise<void> {
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
       if (element)
       {
           return this.getScriptFilesAsync(`${element.directory === '' ? '' : element.directory +"/"}*.{sh,bat,ps,ps1,py}`);
       } 
        return this.getScriptFoldersAsync();
    }
    
    async getScriptFilesAsync( pattern: string = "**/*.{sh,bat,ps,ps1,py}"): Promise<TaskDescription[]>{

        const files: any = await vscode.workspace.findFiles(pattern).then(
            (f: vscode.Uri[]) => f.map((uri) =>  
            {
                return {path: uri.path, folder: vscode.workspace.asRelativePath(uri)};
            }));

        return await files.map((f: any)=> {
            const description = new TaskFileDescription(f.path, f.folder,undefined);
            return description;
        });
    }

    async getScriptFoldersAsync( pattern: string = "**/*.{sh,bat,ps,ps1,py}"): Promise<TaskDescription[]>{

        // TODO: group by folder
        const files: any = await vscode.workspace.findFiles(pattern).then(
            (f: vscode.Uri[]) => f.map((uri) =>  
            {
                return {path: uri.path, folder: vscode.workspace.asRelativePath(uri)};
            }));

        return await this.unique(files.map((f: any)=> {
            const description = new TaskDescription(f.path, f.folder,undefined);
            return description;
        }));
    }

    async unique(tasks: TaskDescription[]) : Promise<TaskDescription[]>{
        let result:Array<string> = new Array<string>();
        return tasks.filter((t) => {
            if (result.indexOf(t.directory) < 0) {
                result.push(t.directory);
                return true;}
            return false;
        });
    }

}