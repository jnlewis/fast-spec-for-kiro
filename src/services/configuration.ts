import * as vscode from 'vscode';

export class ConfigurationService {
  private readonly configSection = 'fastSpecForKiro';
  private readonly defaultTemplate = 'Implement the feature described in spec folder {{specPath}}. Read requirements.md and design.md. Also read tasks.md if it exists and update the task list as you progress.';
  private readonly placeholder = '{{specPath}}';

  getPromptTemplate(): string {
    const config = vscode.workspace.getConfiguration(this.configSection);
    return config.get<string>('promptTemplate', this.defaultTemplate);
  }

  getPlaceholder(): string {
    return this.placeholder;
  }


}
