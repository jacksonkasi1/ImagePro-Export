import { ExportOption, ExportScaleOption, CaseOption } from './enums';
import { NodeData } from './node';

export interface ImageExportState {
  exportOption: ExportOption;
  setExportOption: (option: ExportOption) => void;

  exportScaleOption: ExportScaleOption;
  setExportScaleOption: (option: ExportScaleOption) => void;

  selectedNodes: NodeData[];
  setSelectedNodes: (nodes: NodeData[]) => void;

  allNodesCount: number;
  setAllNodesCount: (count: number) => void;

  selectedNodesCount: number;
  setSelectedNodesCount: (count: number) => void;

  caseOption: CaseOption;
  setCaseOption: (option: CaseOption) => void;
}
