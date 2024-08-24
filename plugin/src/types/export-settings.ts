import { CaseOption, ExportOption, ExportScaleOption } from './enums';

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
  exportOption: ExportOption;
  setExportOption: (option: ExportOption) => void;

  exportScaleOption: ExportScaleOption;
  setExportScaleOption: (option: ExportScaleOption) => void;

  caseOption: CaseOption;
  setCaseOption: (option: CaseOption) => void;

  quality: number;
  setQuality: (quality: number) => void;
}
