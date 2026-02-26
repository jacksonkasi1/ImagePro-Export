// ** import figma utils
import { EventHandler } from '@create-figma-plugin/utilities';

// ** import types
import { NodeData } from '@/types/node';
import { ImageData } from '@/types/utils';
import { ExportRequestData } from '@/types/export-settings';
import { AIRenameGroup, AIRenameResult, AISettings } from '@/types/ai';

export interface FetchImageNodesHandler extends EventHandler {
  name: 'FETCH_IMAGE_NODES';
  handler: (image_nodes: NodeData[]) => void;
}

export interface SearchNodesHandler extends EventHandler {
  name: 'SEARCH_NODES';
  handler: (query: string) => void; // The handler takes a search query string as input
}

export interface ExportAssetsHandler extends EventHandler {
  name: 'EXPORT_ASSETS';
  handler: (data: ExportRequestData) => void; // The handler takes export request data as input
}

export interface ExportCompleteHandler extends EventHandler {
  name: 'EXPORT_COMPLETE';
  handler: (data: ImageData[]) => void; // The handler takes an array of ImageData as input
}

export interface NotificationHandler extends EventHandler {
  name: 'NOTIFY';
  handler: (message: string, type: 'success' | 'warn' | 'error' | 'loading', timeout?: number) => void;
}

// Type for the data operations in clientStorage
export interface SetDataHandler extends EventHandler {
  name: 'SET_DATA';
  handler: (payload: { handle: string; data: any }) => Promise<void>;
}

export interface GetDataHandler extends EventHandler {
  name: 'GET_DATA';
  handler: (payload: { handle: string }) => Promise<void>;
}

export interface DeleteDataHandler extends EventHandler {
  name: 'DELETE_DATA';
  handler: (payload: { handle: string }) => Promise<void>;
}

export interface ReceiveDataHandler extends EventHandler {
  name: 'RECEIVE_DATA';
  handler: (payload: { data: any, handle: string }) => void; // 'data' can be of any type
}

// AI Rename events

export interface AIRenameRequestHandler extends EventHandler {
  name: 'AI_RENAME_REQUEST';
  handler: (payload: { nodeIds: string[]; readImage: boolean; settings: AISettings }) => void;
}

export interface AIBatchReadyHandler extends EventHandler {
  name: 'AI_BATCH_READY';
  handler: (groups: AIRenameGroup[]) => void;
}

export interface AIApplyRenameHandler extends EventHandler {
  name: 'AI_APPLY_RENAME';
  handler: (rename: AIRenameResult) => void;
}

export interface AIRenameProgressHandler extends EventHandler {
  name: 'AI_RENAME_PROGRESS';
  handler: (update: { nodeId: string; newName: string; status: 'done' | 'error' }) => void;
}

export interface AIRenameCompleteHandler extends EventHandler {
  name: 'AI_RENAME_COMPLETE';
  handler: () => void;
}

export interface AIRenameErrorHandler extends EventHandler {
  name: 'AI_RENAME_ERROR';
  handler: (payload: { nodeId: string; error: string }) => void;
}
