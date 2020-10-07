import { stringify } from 'querystring';
import * as vscode from 'vscode';

export class TaskDescription extends vscode.TreeItem
{
    private execution: string | undefined = undefined;

    constructor(file: string, exec: string | undefined) {
        super(file, vscode.TreeItemCollapsibleState.Collapsed);

       this.setExecutionCommand(exec); 
    }

    get fullCommand() {
        return this.execution ? `${this.execution} ${this.label}` :
            `${this.getExecutionParameters(this.label)}`;
    }

    setExecutionCommand(exec: string | undefined) {
        this.execution = exec;
    }

    getExecutionParameters (file:string | undefined) {
       const getExtensions = (f:string | undefined):string => {
           if (f) { return f.slice((f.lastIndexOf(".") - 1 >>> 0) + 2);} 
           return "";
       };

       return getExtensions(file) + ' ' + file;
    }
}