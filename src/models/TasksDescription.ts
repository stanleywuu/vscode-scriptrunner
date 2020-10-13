import { pathToFileURL } from 'url';
import * as vscode from 'vscode';
import * as path from 'path';

export class TaskDescription extends vscode.TreeItem
{
    private relativeDirectory: string | undefined = undefined;

    constructor(file: string, relativeDirectory: string, exec: string | undefined) {
        super(file, vscode.TreeItemCollapsibleState.Collapsed);

        this.relativeDirectory = relativeDirectory;
        this.label = this.directory === '' ? './' : this.directory;
    }

    get directory():string{
        return path.parse(this.relativeDirectory ?? "./").dir;
    };

}

export class TaskFileDescription extends TaskDescription
{
    private execution: string | undefined = undefined;
    private filePath: string | undefined = undefined;

    constructor(file: string, relativeDirectory: string, command: vscode.Command, exec: string | undefined) {
        super(file, relativeDirectory, exec);

        this.filePath = file;
        this.label = path.parse(file).name + path.parse(file).ext;

        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
        this.command = command;
    }

    setExecutionCommand(exec: string | undefined) {
        this.execution = exec;
    }

    get extension(){
        return path.parse(this.filePath ?? "").ext;
    }

    get file(){
        return this.filePath;
    }

    get fullCommand() {
        return this.execution ? `${this.execution} ${this.label}` :
            `${this.getExecutionParameters(this.filePath)}`;
    }

    getExecutionParameters (file:string | undefined) {
       const getExtensions = (f:string | undefined):string => {
           if (f) { return f.slice((f.lastIndexOf(".") - 1 >>> 0) + 2);} 
           return "";
       };

       return getExtensions(this.filePath) + ' ' + this.filePath;
    }
}
