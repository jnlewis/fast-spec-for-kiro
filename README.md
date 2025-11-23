# Fast Spec for Kiro

Kiro IDE extension for faster spec implementations. Quickly send spec implementation requests to Kiro CLI with a single comma

> **Note:** This extension uses a simple prompt for rapid MVP development and experimentation. For production-quality builds, use Kiro's primary spec implementation feature. This is a complementary tool for fast iteration, not a replacement.

## Features

Right-click any spec folder or file in `.kiro/specs/` and instantly send implementation requests to Kiro Chat.

- **Context menu integration** - Right-click spec folders or files to implement
- **Command palette support** - Quick access via `Cmd+Shift+P`
- **Customizable prompts** - Configure your implementation prompt

## Usage

### Quick Start

1. Navigate to any folder in `.kiro/specs/` in the Explorer
2. Right-click the spec folder or any spec file (`requirements.md`, `design.md`, `tasks.md`)
3. Select **"Fast Spec for Kiro: Implement Spec"**

### Command Palette

1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux), then type: `Fast Spec for Kiro: Implement Spec`
2. Select a spec from the list and it will be sent to Kiro Chat.

## Configuration

Customize the implementation prompt template in Settings:

1. Open Command Palette → **"Fast Spec for Kiro: Configure Prompt"**
2. Edit the template in the multi-line text area

## Requirements

- Kiro IDE
- Kiro CLI

## License

MIT
