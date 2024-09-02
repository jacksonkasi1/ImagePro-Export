// ** import figma utils
import { EventHandler } from '@create-figma-plugin/utilities';

// ** import types
import { NodeData } from '@/types/node';
import { ImageData } from '@/types/utils';
import { ExportRequestData } from '@/types/export-settings';

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
