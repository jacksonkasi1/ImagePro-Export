import create from "zustand";

// ** import types
import { NodeData } from "@/types/node";
import { ImageNodesState } from "@/types/node";

export const useImageNodesStore = create<ImageNodesState>((set) => ({
  allNodes: [],
  setAllNodes: (nodes: NodeData[]) => set({ allNodes: nodes }),

  selectedNodeIds: [],
  setSelectedNodeIds: (ids: string[] | ((prev: string[]) => string[])) =>
    set((state) => ({
      selectedNodeIds:
        typeof ids === "function" ? ids(state.selectedNodeIds) : ids,
    })),

  allNodesCount: 0,
  setAllNodesCount: (count: number) => set({ allNodesCount: count }),

  selectedNodesCount: 0,
  setSelectedNodesCount: (count: number) => set({ selectedNodesCount: count }),
}));
