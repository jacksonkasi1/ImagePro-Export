// ** import types
import type { CaseOption } from './enums';

export type AIModelProvider = 'gemini' | 'openai' | 'anthropic';

export type AIRenameStatus = 'idle' | 'pending' | 'done' | 'error';

export type AINodeClassification = 'svg_leaf' | 'raster_leaf' | 'section';

/** Which sub-tab is active inside the AI page */
export type AIMode = 'images' | 'layers';

/**
 * Settings that are safe to persist in Figma clientStorage alongside other
 * non-sensitive configuration.  API key is intentionally excluded — it is
 * stored under a separate clientStorage key (`aiApiKey`).
 */
export interface AIPersistedSettings {
  modelProvider: AIModelProvider;
  model: string;
  systemPrompt: string;
  readImage: boolean;
  caseOption: CaseOption;
  prefix: string;
  suffix: string;
}

/** Full runtime settings including the API key (never serialised as a whole). */
export interface AISettings extends AIPersistedSettings {
  apiKey: string;
}

export interface AINodeContextChild {
  name: string;
  type: string;
  characters?: string;
}

export interface AINodeContext {
  nodeId: string;
  currentName: string;
  nodeType: string;
  isSvg: boolean;
  dimensions: { width: number; height: number };
  children?: AINodeContextChild[];
}

export interface AIRenameGroup {
  groupId: string;
  contextText: string;
  imageBase64?: string;
  targetNodes: Array<{
    nodeId: string;
    currentName: string;
    nodeType: string;
    isSvg: boolean;
  }>;
}

export interface AIRenameResult {
  nodeId: string;
  suggestedName: string;
}

/**
 * A lightweight node descriptor used by the AI tab node list.
 * Covers all renameable node types — not just image-fill nodes.
 */
export interface AINodeData {
  id: string;
  name: string;
  /** Figma node type string, e.g. 'FRAME', 'TEXT', 'RECTANGLE', 'COMPONENT' */
  nodeType: string;
  /** Optional thumbnail for image-fill or raster nodes */
  thumbnail?: Uint8Array;
}

export interface AIState {
  /** Active sub-tab inside the AI page */
  aiMode: AIMode;
  setAIMode: (mode: AIMode) => void;

  /** Nodes for the Images sub-tab (recursed IMAGE-fill nodes) */
  aiImageNodes: AINodeData[];
  setAIImageNodes: (nodes: AINodeData[]) => void;
  selectedAIImageNodeIds: string[];
  setSelectedAIImageNodeIds: (ids: string[] | ((prev: string[]) => string[])) => void;

  /** Nodes for the Layers sub-tab (top-level selected, non-image) */
  aiLayerNodes: AINodeData[];
  setAILayerNodes: (nodes: AINodeData[]) => void;
  selectedAILayerNodeIds: string[];
  setSelectedAILayerNodeIds: (ids: string[] | ((prev: string[]) => string[])) => void;

  /** Settings for Images sub-tab */
  settings: AISettings;
  setSettings: (settings: Partial<AISettings>) => void;

  /** Settings for Layers sub-tab (separate prefix/suffix/readImage) */
  layerSettings: AISettings;
  setLayerSettings: (settings: Partial<AISettings>) => void;

  renameStatuses: Record<string, AIRenameStatus>;
  renamedNames: Record<string, string>;
  setRenameStatus: (nodeId: string, status: AIRenameStatus, newName?: string) => void;
  resetStatuses: () => void;

  isRunning: boolean;
  setIsRunning: (running: boolean) => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  progress: { done: number; total: number };
  setProgress: (progress: { done: number; total: number }) => void;

  // ── legacy shims used by AINodeList / AIPage (always points to the active mode's data) ──
  /** @deprecated use aiImageNodes / aiLayerNodes directly */
  aiNodes: AINodeData[];
  /** @deprecated use selectedAIImageNodeIds / selectedAILayerNodeIds directly */
  selectedAINodeIds: string[];
  /** @deprecated use setSelectedAIImageNodeIds / setSelectedAILayerNodeIds directly */
  setSelectedAINodeIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  /** @deprecated use setAIImageNodes / setAILayerNodes directly */
  setAINodes: (nodes: AINodeData[]) => void;
}
