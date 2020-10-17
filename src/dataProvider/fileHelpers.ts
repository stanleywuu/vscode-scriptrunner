import * as vscode from "vscode";
import * as fs from "fs";

export async function getDataFromFile(filePath: vscode.Uri): Promise<any[]> {
  if (!fs.existsSync(filePath.path)) {
    fs.appendFileSync(filePath.path, "[]");
  }

  const document = await vscode.workspace.openTextDocument(filePath.path);

  return document ? JSON.parse(document.getText()) : [];
}

export function ignoreTasksFile(query: string | null): vscode.Uri[]{
  const targetFile = 'ignore';
  
  if (query){
    return [vscode.Uri.file(query + "/" + targetFile + ".json")];
  }
  const workspaces = vscode.workspace.workspaceFolders;

  if (workspaces){
    const filePaths: vscode.Uri[] = workspaces.map((w) => {
      return w
        ? vscode.Uri.file(`${w.uri.fsPath}/${targetFile}.json`)
        : vscode.Uri.file("");
    });
    return filePaths;
  }
  
  return [vscode.Uri.file("")];
}

export function customTasksFile(query: string | null): vscode.Uri[] {
  const targetFile = "customTasks";
  // if query exists, but it's a directory 
  // just directly look to see if there is a file there, lol
  const workspaces: (vscode.WorkspaceFolder | undefined)[] | undefined = query
    ? [vscode.workspace.getWorkspaceFolder(vscode.Uri.file(query))]
    : vscode.workspace.workspaceFolders?.map((w) => w);

  if (workspaces) {
    const filePaths: vscode.Uri[] = workspaces.map((w) => {
      return w
        ? vscode.Uri.file(w.uri.fsPath + "/" + targetFile + ".json")
        : vscode.Uri.file("");
    });

    return filePaths;
  }

  return [vscode.Uri.file("")];
}
