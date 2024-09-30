import { create } from 'zustand';

// ** import types
import { ImageExportState } from '@/types/export-settings';
import {
  FormatOption,
  ExportScaleOption,
  CaseOption,
  ExportMode,
  PdfFormatOption,
  AssetsExportType,
} from '@/types/enums';

export const useImageExportStore = create<ImageExportState>((set) => ({
  formatOption: FormatOption.JPG,
  setFormatOption: (option: FormatOption) => set({ formatOption: option }),

  exportScaleOption: ExportScaleOption.ONE_X,
  setExportScaleOption: (option: ExportScaleOption) => set({ exportScaleOption: option }),

  caseOption: CaseOption.CAMEL_CASE,
  setCaseOption: (option: CaseOption) => set({ caseOption: option }),

  quality: 80, // default 80% quality
  setQuality: (quality: number) => set({ quality }),

  exportMode: ExportMode.ZIP, // default export mode
  setExportMode: (mode: ExportMode) => set({ exportMode: mode }), // Setter for export mode

  pdfFormatOption: PdfFormatOption.RGB, // default to RGB
  setPdfFormatOption: (option: PdfFormatOption) => set({ pdfFormatOption: option }),

  pdfPassword: '',
  setPdfPassword: (password: string) => set({ pdfPassword: password }),

  assetsExportType: AssetsExportType.MULTI,
  setAssetsExportType: (option: AssetsExportType) => set({ assetsExportType: option }),
}));
