export interface ExportSettings {
    format: string;
    constraint?: { type: "SCALE", value: number };
  }
  
  export interface ExportSettingsImage extends ExportSettings {
    format: "PNG" | "JPG";
  }
  
  export interface ExportSettingsPDF extends ExportSettings {
    format: "PDF";
  }
  
  export interface ExportSettingsSVG extends ExportSettings {
    format: "SVG";
  }
  