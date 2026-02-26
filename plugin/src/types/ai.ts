// ** import types
import type { CaseOption } from './enums';

export type AIModelProvider = 'gemini' | 'openai' | 'anthropic';

export type AIRenameStatus = 'idle' | 'pending' | 'done' | 'error';

export type AINodeClassification = 'svg_leaf' | 'raster_leaf' | 'section';

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

export interface AIState {
  settings: AISettings;
  setSettings: (settings: Partial<AISettings>) => void;

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
}
