// ** import types
import { NodeData } from "./node";
import { ExportOption, ExportScaleOption, CaseOption } from "./enums";

export interface ImageExportState {
  exportOption: ExportOption;
  setExportOption: (option: ExportOption) => void;

  exportScaleOption: ExportScaleOption;
  setExportScaleOption: (option: ExportScaleOption) => void;

  allNodes: NodeData[];
  setAllNodes: (nodes: NodeData[]) => void;

  selectedNodes: NodeData[];
  setSelectedNodes: (nodes: NodeData[]) => void;

  allNodesCount: number;
  setAllNodesCount: (count: number) => void;

  selectedNodesCount: number;
  setSelectedNodesCount: (count: number) => void;

  caseOption: CaseOption;
  setCaseOption: (option: CaseOption) => void;
}