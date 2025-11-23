import { SpecInfo } from '../models/specInfo';

export class PromptBuilder {
  buildPrompt(specInfo: SpecInfo, template: string, placeholder: string): string {
    if (template.includes(placeholder)) {
      return template.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), specInfo.relativePath);
    } else {
      return `${template} ${specInfo.relativePath}`;
    }
  }
}
