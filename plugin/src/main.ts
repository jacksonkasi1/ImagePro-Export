// ** import figma utils
import { emit, on, showUI } from '@create-figma-plugin/utilities';

// ** import handlers
import { getImageNodes } from './core/handlers/fetch-images-handler';
import { searchNodes } from './core/handlers/search-nodes-handler';
import { handleExportRequest } from './core/handlers/export-handler';

// ** import types
import { NodeData } from './types/node';
import { ExportAssetsHandler, FetchImageNodesHandler, NotificationHandler, SearchNodesHandler } from './types/events';

export default function () {
  showUI({
    height: 540, // min - 540
    width: 320, // min - 320
  });
}

/**
 * Fetches image nodes and emits an event with the fetched nodes.
 * @param {Array<SceneNode>} nodes - Array of selected nodes.
 */
const fetchAndEmitImageNodes = async (nodes: ReadonlyArray<SceneNode>) => {
  const allImageNodes: NodeData[] = [];

  for (const node of nodes) {
    await getImageNodes(node, allImageNodes);
  }

  emit<FetchImageNodesHandler>('FETCH_IMAGE_NODES', allImageNodes);
};

/**
 * Initializes the Figma plugin, and fetching initial nodes if any are selected.
 */
const initializePlugin = async () => {
  const selectedNodes = figma.currentPage.selection;
  await fetchAndEmitImageNodes(selectedNodes);
};

void initializePlugin();

// ** Notification handler **
on<NotificationHandler>('NOTIFY', (message, type, timeout = 3000) => {
  let icon = '';
  switch (type) {
    case 'success':
      icon = '✔️';
      break;
    case 'warn':
      icon = '⚠️';
      break;
    case 'error':
      icon = '✘';
      break;
    case 'loading':
      icon = '⏳';
      break;
  }
  figma.notify(`${icon} ${message}`, { timeout });
});

/**
 * Triggered when the node selection changes in Figma. Fetches image nodes for the selected nodes.
 */
figma.on('selectionchange', async () => {
  const selectedNodes = figma.currentPage.selection;
  await fetchAndEmitImageNodes(selectedNodes);
});

on<SearchNodesHandler>('SEARCH_NODES', async (query) => {
  const allImageNodes: NodeData[] = await searchNodes(query);
  emit<FetchImageNodesHandler>('FETCH_IMAGE_NODES', allImageNodes);
});

on<ExportAssetsHandler>('EXPORT_ASSETS', async (data) => {
  await handleExportRequest(data);
});
