import create from "zustand";

// ** import types
import { ImageExportState } from "@/types/state";
import { ExportOption, ExportScaleOption, CaseOption } from "@/types/enums";
import { NodeData } from "@/types/node";

export const useImageExportStore = create<ImageExportState>((set) => ({
  exportOption: ExportOption.PNG,
  setExportOption: (option: ExportOption) => set({ exportOption: option }),

  exportScaleOption: ExportScaleOption.ONE_X,
  setExportScaleOption: (option: ExportScaleOption) =>
    set({ exportScaleOption: option }),

  allNodes: [],
  setAllNodes: (nodes: NodeData[]) => set({ allNodes: nodes }),

  selectedNodes: [],
  setSelectedNodes: (nodes: NodeData[]) => set({ selectedNodes: nodes }),

  allNodesCount: 0,
  setAllNodesCount: (count: number) => set({ allNodesCount: count }),

  selectedNodesCount: 0,
  setSelectedNodesCount: (count: number) => set({ selectedNodesCount: count }),

  caseOption: CaseOption.CAMEL_CASE,
  setCaseOption: (option: CaseOption) => set({ caseOption: option }),
}));