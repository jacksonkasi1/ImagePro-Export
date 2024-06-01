import create from "zustand";

// ** import types
import { NodeData } from "@/types/node";
import { ImageExportState } from "@/types/state";
import { ExportOption, ExportScaleOption, CaseOption } from "@/types/enums";


export const useImageExportStore = create<ImageExportState>((set) => ({
  exportOption: ExportOption.JPG,
  setExportOption: (option: ExportOption) => set({ exportOption: option }),

  exportScaleOption: ExportScaleOption.ONE_X,
  setExportScaleOption: (option: ExportScaleOption) =>
    set({ exportScaleOption: option }),

  allNodes: [],
  setAllNodes: (nodes: NodeData[]) => set({ allNodes: nodes }),

  selectedNodeIds: [],
  setSelectedNodeIds: (ids: string[] | ((prev: string[]) => string[])) =>
    set((state) => ({
      selectedNodeIds: typeof ids === 'function' ? ids(state.selectedNodeIds) : ids,
    })),

  allNodesCount: 0,
  setAllNodesCount: (count: number) => set({ allNodesCount: count }),

  selectedNodesCount: 0,
  setSelectedNodesCount: (count: number) => set({ selectedNodesCount: count }),

  caseOption: CaseOption.CAMEL_CASE,
  setCaseOption: (option: CaseOption) => set({ caseOption: option }),
}));
