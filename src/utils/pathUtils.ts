import * as path from 'path';

export function getRelativePath(absolutePath: string, workspaceRoot: string): string {
  return path.relative(workspaceRoot, absolutePath);
}

export function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}

export function joinPaths(...paths: string[]): string {
  return path.join(...paths);
}
