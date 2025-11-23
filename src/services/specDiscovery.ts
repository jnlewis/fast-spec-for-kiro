import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SpecInfo } from '../models/specInfo';
import { getRelativePath, joinPaths } from '../utils/pathUtils';

export class SpecDiscoveryService {
  private readonly specFiles = ['requirements.md', 'design.md', 'tasks.md'];

  async findSpecs(): Promise<SpecInfo[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder is open');
    }

    const allSpecs: SpecInfo[] = [];

    for (const workspaceFolder of workspaceFolders) {
      const specsDir = joinPaths(workspaceFolder.uri.fsPath, '.kiro', 'specs');
      
      if (!fs.existsSync(specsDir)) {
        continue;
      }

      try {
        const entries = fs.readdirSync(specsDir, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const specPath = joinPaths(specsDir, entry.name);
            
            if (await this.validateSpecDirectory(specPath)) {
              const relativePath = getRelativePath(specPath, workspaceFolder.uri.fsPath);
              const specInfo = await this.createSpecInfo(entry.name, specPath, relativePath);
              allSpecs.push(specInfo);
            }
          }
        }
      } catch (error) {
        throw new Error(`Error reading specs directory: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return allSpecs;
  }

  async validateSpecDirectory(dirPath: string): Promise<boolean> {
    try {
      for (const fileName of this.specFiles) {
        const filePath = joinPaths(dirPath, fileName);
        if (fs.existsSync(filePath)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async createSpecInfo(name: string, absolutePath: string, relativePath: string): Promise<SpecInfo> {
    const hasRequirements = fs.existsSync(joinPaths(absolutePath, 'requirements.md'));
    const hasDesign = fs.existsSync(joinPaths(absolutePath, 'design.md'));
    const hasTasks = fs.existsSync(joinPaths(absolutePath, 'tasks.md'));

    return {
      name,
      path: absolutePath,
      relativePath,
      hasRequirements,
      hasDesign,
      hasTasks
    };
  }
}
