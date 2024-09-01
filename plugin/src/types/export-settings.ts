import { CaseOption, FormatOption, ExportScaleOption, ExportMode, PdfFormatOption } from './enums';
export interface ExportSettings {
  format: string;
  constraint?: { type: 'SCALE'; value: number };
}

export interface ExportSettingsImage extends ExportSettings {
  format: 'PNG' | 'JPG';
}

export interface ExportSettingsPDF extends ExportSettings {
  format: 'PDF';
  colorProfile?: 'DOCUMENT' | 'SRGB' | 'DISPLAY_P3_V4';
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

  pdfFormatOption: PdfFormatOption;
  setPdfFormatOption: (option: PdfFormatOption) => void;
}

export interface ExportRequestData {
  selectedNodeIds: string[];
  formatOption: FormatOption;
  exportScaleOption: string;
  caseOption: string;
  pdfFormatOption?: PdfFormatOption;
}
