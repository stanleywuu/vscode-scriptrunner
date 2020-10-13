import * as vscode from 'vscode';
import * as fs from 'fs';
import {TaskDescription, TaskFileDescription} from '../models/TasksDescription';

export class TasksProvider implements vscode.TreeDataProvider<TaskDescription>{

    private _onDidChangeTreeData: vscode.EventEmitter<TaskDescription | null> = new vscode.EventEmitter<TaskDescription | null>();
    readonly onDidChangeTreeData: vscode.Event<TaskDescription | null> = this._onDidChangeTreeData.event;

	private autoRefresh: boolean | undefined = true;

	constructor(private context: vscode.ExtensionContext) {
		// this.autoRefresh = vscode.workspace.getConfiguration('taskOutline').get('autorefresh');
	}

	refresh(): void {
		this._onDidChangeTreeData.fire(null);
    }
    
    async ignoreItem(context: any) : Promise<void> {
        const directory = context.directory;
        const file = context.file ?? "";

        const filePath = this.metaFile(context.file ?? "", "ignore");
        const ignores = await this.getDataFromFile(filePath[0]);

        const glob = file ? `**/${directory}/${file}/` : `**/${directory}/*`;

        const allIgnores = [...ignores, {glob: glob}];
        const content = JSON.stringify(allIgnores);

        fs.writeFile(filePath[0].path, content, ()=> {});
    }

    async allIgnoreGlobs(directory: string | null) : Promise<any[]>{
        const uri = this.metaFile(directory, "ignore");
        const ignores = await this.getDataFromFile(uri[0]);
        
        return ignores;
    }

    async getDataFromFile(filePath: vscode.Uri): Promise<any[]>{
            if (!fs.existsSync(filePath.path)){
                fs.appendFileSync(filePath.path, '[]');
            }

            const document = await vscode.workspace.openTextDocument(filePath.path);

            return document ? JSON.parse(document.getText()) : [];
    }

    metaFile(query: string | null, targetFile: string): vscode.Uri[] {
        const workspaces : (vscode.WorkspaceFolder | undefined)[] | undefined = 
            query ?[ vscode.workspace.getWorkspaceFolder(vscode.Uri.file(query))]:
            vscode.workspace.workspaceFolders?.map((w)=> w);

        if (workspaces){
            const filePaths: vscode.Uri[] = workspaces.map(
                (w) => {
                    return w ? vscode.Uri.file(w.uri.fsPath + '/' + targetFile + ".json") :
                        vscode.Uri.file("");
                });

            return filePaths;
        }

        return [vscode.Uri.file("")];
    }

    async customizeTasks(context: TaskFileDescription) : Promise<void>{
        const filePath = this.metaFile(context.file ?? "", "customTasks");
        const tasks = await this.getDataFromFile(filePath[0]);

        const taskName = await vscode.window.showInputBox({placeHolder: context.label, prompt: 'Name of the task'});
        const execution = await vscode.window.showInputBox({value: context.fullCommand, prompt: 'Full execution of the task'});

        const targetTask = {
            name: taskName,
            execution: execution
        };

        const allTasks = [...tasks, targetTask];
        const content = JSON.stringify(allTasks);

        fs.writeFile(filePath[0].path, content, ()=> {});

        console.log('getting tasks from task');
    }

    async execute(context: TaskFileDescription) : Promise<void> {
        console.log(context.label);
        const command = context.fullCommand;
        const shell = new vscode.ShellExecution(command, {
            cwd: context.directory
        });

        const task = new vscode.Task({type: 'shell'}, vscode.TaskScope.Workspace, 'execute task', 'source', shell);
        await vscode.tasks.executeTask(task);
    }


    async edit(context: any) : Promise<void> {
        const file = context;
        await vscode.workspace.openTextDocument(file ?? "").then(doc =>
            vscode.window.showTextDocument(doc));
    }
    
    getTreeItem(element: TaskDescription): vscode.TreeItem {
       return element; 
    }

    getChildren(element?: TaskDescription): vscode.ProviderResult<TaskDescription[]> {
       if (element)
       {
           return this.getScriptFilesAsync(
               `${element.directory === '' ? '' : element.directory +"/"}*.{sh,bat,ps,ps1,py}`, element.directory);
       } 
        return this.getScriptFoldersAsync();
    }

    async getIgnorePattern(directory: string | null):Promise<string>{
        // what if directory was null
        const ignoreFiles = await this.allIgnoreGlobs(directory);
        let multiFilePattern = "{**/node_modules/**";

        ignoreFiles.forEach(ig=>{
            multiFilePattern += ",";
            multiFilePattern += ig.glob;
        });

        multiFilePattern += "}";

        return multiFilePattern;
    }
    
    async getScriptFilesAsync( pattern: string = "**/*.{sh,bat,ps,ps1,py}", directory: string | null): Promise<TaskDescription[]>{

        const ignorePattern = await this.getIgnorePattern(directory);
        const files: any = await vscode.workspace.findFiles(pattern, ignorePattern).then(
            (f: vscode.Uri[]) => f.map((uri) =>  
            {
                return new TaskFileDescription(uri.path, vscode.workspace.asRelativePath(uri), 
                    {
                        command:'task-list.edit',
                        title: 'edit',
                        arguments: [uri.path],
                        tooltip: 'Open the script file in file editor'},
                        undefined);
            }));

        return await files;
    }

    async getScriptFoldersAsync(pattern: string = "**/*.{sh,bat,ps,ps1,py}"): Promise<TaskDescription[]>{
        const multiFileIgnorePattern = await this.getIgnorePattern(null);

        const files: any = await vscode.workspace.findFiles(pattern, multiFileIgnorePattern).then(
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