export type NodeType =
  | 'BOOLEAN_OPERATION'
  | 'CODE_BLOCK'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'CONNECTOR'
  | 'DOCUMENT'
  | 'ELLIPSE'
  | 'EMBED'
  | 'FRAME'
  | 'GROUP'
  | 'INSTANCE'
  | 'LINE'
  | 'LINK_UNFURL'
  | 'MEDIA'
  | 'IMAGE'
  | 'PAGE'
  | 'POLYGON'
  | 'RECTANGLE'
  | 'SHAPE_WITH_TEXT'
  | 'SLICE'
  | 'STAMP'
  | 'STAR'
  | 'STICKY'
  | 'TABLE'
  | 'TABLE_CELL'
  | 'TEXT'
  | 'VECTOR'
  | 'WIDGET';

export interface NodeData {
  id: string;
  name: string;
  type: NodeType;
  imageData: Uint8Array;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface ImageNodesState {
  allNodes: NodeData[];
  setAllNodes: (nodes: NodeData[]) => void;

  selectedNodeIds: string[];
  setSelectedNodeIds: (ids: string[] | ((prev: string[]) => string[])) => void;

  allNodesCount: number;
  setAllNodesCount: (count: number) => void;

  selectedNodesCount: number;
  setSelectedNodesCount: (count: number) => void;

  selectedNodesOrder: string[];
  setSelectedNodesOrder: (order: string[] | ((prev: string[]) => string[])) => void;
}
