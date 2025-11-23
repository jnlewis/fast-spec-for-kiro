export interface SpecInfo {
  name: string;           // Display name (folder name)
  path: string;           // Absolute path to spec folder
  relativePath: string;   // Relative path from workspace root
  hasRequirements: boolean;
  hasDesign: boolean;
  hasTasks: boolean;
}
