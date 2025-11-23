import * as vscode from 'vscode';
import { SpecDiscoveryService } from './services/specDiscovery';
import { ConfigurationService } from './services/configuration';
import { PromptBuilder } from './services/promptBuilder';
import { KiroIntegrationService } from './services/kiroIntegration';
import { SpecInfo } from './models/specInfo';

let kiroIntegration: KiroIntegrationService;

export function activate(context: vscode.ExtensionContext) {
  const specDiscovery = new SpecDiscoveryService();
  const configService = new ConfigurationService();
  const promptBuilder = new PromptBuilder();
  kiroIntegration = new KiroIntegrationService();

  // Command from command palette - shows picker
  const disposable = vscode.commands.registerCommand('fastSpecForKiro.implementSpec', async () => {
    try {
      // Discover specs
      const specs = await specDiscovery.findSpecs();

      if (specs.length === 0) {
        vscode.window.showInformationMessage('No specs found in .kiro/specs directory. Please create a spec folder with requirements.md, design.md, or tasks.md.');
        return;
      }

      // Show quick pick for spec selection
      const quickPickItems = specs.map(spec => ({
        label: spec.name,
        description: spec.relativePath,
        specInfo: spec
      }));

      const selected = await vscode.window.showQuickPick(quickPickItems, {
        placeHolder: 'Select a spec to implement'
      });

      if (!selected) {
        // User cancelled
        return;
      }

      // Validate that requirements.md and design.md exist
      if (!selected.specInfo.hasRequirements || !selected.specInfo.hasDesign) {
        const missing = [];
        if (!selected.specInfo.hasRequirements) missing.push('requirements.md');
        if (!selected.specInfo.hasDesign) missing.push('design.md');
        
        vscode.window.showWarningMessage(
          `Cannot implement spec: Missing ${missing.join(' and ')}. Please create the spec requirements and design before running Implement Spec.`
        );
        return;
      }

      // Build prompt
      const template = configService.getPromptTemplate();
      const placeholder = configService.getPlaceholder();
      const prompt = promptBuilder.buildPrompt(selected.specInfo, template, placeholder);

      // Send to Kiro
      await kiroIntegration.sendToChat(prompt);
      await kiroIntegration.focusChatWindow();

      vscode.window.showInformationMessage(`Sent implementation request for ${selected.specInfo.name} to Kiro CLI`);
    } catch (error) {
      vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // Command from context menu - uses clicked file/folder
  const contextDisposable = vscode.commands.registerCommand('fastSpecForKiro.implementSpecFromContext', async (uri: vscode.Uri) => {
    try {
      if (!uri) {
        vscode.window.showErrorMessage('No file or folder selected');
        return;
      }

      const fs = require('fs');
      const path = require('path');

      // Determine the spec folder path
      let specFolderPath = uri.fsPath;
      const stat = fs.statSync(specFolderPath);
      
      // If it's a file, get the parent directory
      if (stat.isFile()) {
        specFolderPath = path.dirname(specFolderPath);
      }

      // Validate it's a spec directory
      if (!await specDiscovery.validateSpecDirectory(specFolderPath)) {
        vscode.window.showErrorMessage('Please first create requirements and design in spec.');
        return;
      }

      // Find workspace folder to get relative path
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder is open');
        return;
      }

      // Find which workspace folder contains this spec
      let workspaceRoot = workspaceFolders[0].uri.fsPath;
      for (const folder of workspaceFolders) {
        if (specFolderPath.startsWith(folder.uri.fsPath)) {
          workspaceRoot = folder.uri.fsPath;
          break;
        }
      }

      // Create SpecInfo with actual file checks
      const hasRequirements = fs.existsSync(path.join(specFolderPath, 'requirements.md'));
      const hasDesign = fs.existsSync(path.join(specFolderPath, 'design.md'));
      const hasTasks = fs.existsSync(path.join(specFolderPath, 'tasks.md'));
      
      const relativePath = path.relative(workspaceRoot, specFolderPath);
      const specName = path.basename(specFolderPath);
      const specInfo: SpecInfo = {
        name: specName,
        path: specFolderPath,
        relativePath: relativePath,
        hasRequirements,
        hasDesign,
        hasTasks
      };

      // Validate that requirements.md and design.md exist
      if (!hasRequirements || !hasDesign) {
        const missing = [];
        if (!hasRequirements) missing.push('requirements.md');
        if (!hasDesign) missing.push('design.md');
        
        vscode.window.showWarningMessage(
          `Cannot implement spec: Missing ${missing.join(' and ')}. Please create the spec requirements and design before running Implement Spec.`
        );
        return;
      }

      // Build and send prompt
      const template = configService.getPromptTemplate();
      const placeholder = configService.getPlaceholder();
      const prompt = promptBuilder.buildPrompt(specInfo, template, placeholder);

      await kiroIntegration.sendToChat(prompt);
      await kiroIntegration.focusChatWindow();

      vscode.window.showInformationMessage(`Sent implementation request for ${specInfo.name} to Kiro CLI`);
    } catch (error) {
      vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // Command to open configuration
  const configDisposable = vscode.commands.registerCommand('fastSpecForKiro.openConfiguration', async () => {
    // Open settings UI focused on this extension's settings
    await vscode.commands.executeCommand('workbench.action.openSettings', 'fastSpecForKiro.promptTemplate');
  });

  context.subscriptions.push(disposable, contextDisposable, configDisposable);
}

export function deactivate() {
  if (kiroIntegration) {
    kiroIntegration.dispose();
  }
}
