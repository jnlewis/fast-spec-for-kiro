import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class KiroIntegrationService {
  private terminal: vscode.Terminal | undefined;
  private cliChecked: boolean = false;
  private cliAvailable: boolean = false;

  async sendToChat(message: string): Promise<void> {
    try {
      // Check if kiro-cli is installed (only check once per session)
      if (!this.cliChecked) {
        await this.checkKiroCli();
      }

      if (!this.cliAvailable) {
        const install = await vscode.window.showErrorMessage(
          'kiro-cli is not installed or not in your PATH. Please install it to use this extension.',
          'How to Install',
          'Cancel'
        );
        
        if (install === 'How to Install') {
          vscode.env.openExternal(vscode.Uri.parse('https://kiro.dev/cli'));
        }
        return;
      }

      // Always create a new terminal for each implementation
      this.terminal = vscode.window.createTerminal({
        name: 'Kiro CLI',
        hideFromUser: false
      });

      // Escape the message for shell execution
      const escapedMessage = this.escapeShellArg(message);
      
      // Send command to terminal
      this.terminal.sendText(`kiro-cli chat ${escapedMessage}`);
      
      // Show the terminal
      this.terminal.show(true);
    } catch (error) {
      throw new Error(`Failed to send message to Kiro CLI: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async checkKiroCli(): Promise<void> {
    this.cliChecked = true;
    try {
      await execAsync('kiro-cli --version');
      this.cliAvailable = true;
    } catch (error) {
      this.cliAvailable = false;
    }
  }

  async focusChatWindow(): Promise<void> {
    // Focus is handled by terminal.show() in sendToChat
    if (this.terminal) {
      this.terminal.show(true);
    }
  }

  private escapeShellArg(arg: string): string {
    // Escape single quotes and wrap in single quotes for shell safety
    return `'${arg.replace(/'/g, "'\\''")}'`;
  }

  dispose(): void {
    if (this.terminal) {
      this.terminal.dispose();
    }
  }
}
