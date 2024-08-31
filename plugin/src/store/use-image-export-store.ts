import { create } from "zustand";

// ** import types
import { ImageExportState } from "@/types/export-settings";
import { FormatOption, ExportScaleOption, CaseOption } from "@/types/enums";

export const useImageExportStore = create<ImageExportState>((set) => ({
  formatOption: FormatOption.JPG,
  setFormatOption: (option: FormatOption) => set({ formatOption: option }),

  exportScaleOption: ExportScaleOption.ONE_X,
  setExportScaleOption: (option: ExportScaleOption) =>
    set({ exportScaleOption: option }),

  caseOption: CaseOption.CAMEL_CASE,
  setCaseOption: (option: CaseOption) => set({ caseOption: option }),

  quality: 0.8, // default 80% quality
  setQuality: (quality: number) => set({ quality }),
}));
