import { EventHandler } from '@create-figma-plugin/utilities';

// ** import types
import { NodeData } from './node';

export interface FetchImageNodesHandler extends EventHandler {
  name: 'FETCH_IMAGE_NODES';
  handler: (image_nodes: NodeData[]) => void;
}

export interface SearchNodesHandler extends EventHandler {
  name: 'SEARCH_NODES';
  handler: (query: string) => void; // The handler takes a search query string as input
}
