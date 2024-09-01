import { CaseOption, FormatOption, ExportScaleOption, ExportMode } from './enums';

export interface ExportSettings {
  format: string;
  constraint?: { type: 'SCALE'; value: number };
}

export interface ExportSettingsImage extends ExportSettings {
  format: 'PNG' | 'JPG';
}

export interface ExportSettingsPDF extends ExportSettings {
  format: 'PDF';
}

export interface ExportSettingsSVG extends ExportSettings {
  format: 'SVG';
}

export interface ImageExportState {
  formatOption: FormatOption;
  setFormatOption: (option: FormatOption) => void;

  exportScaleOption: ExportScaleOption;
  setExportScaleOption: (option: ExportScaleOption) => void;

  caseOption: CaseOption;
  setCaseOption: (option: CaseOption) => void;

  quality: number;
  setQuality: (quality: number) => void;

  exportMode: ExportMode;
  setExportMode: (mode: ExportMode) => void;
}

export interface ExportRequestData {
  selectedNodeIds: string[];
  formatOption: FormatOption; // asset format options
  exportScaleOption: string; // scale options
  caseOption: string; // options for caseOption
}
