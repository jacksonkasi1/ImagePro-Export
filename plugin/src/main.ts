// ** import figma utils
import { emit, on, showUI } from '@create-figma-plugin/utilities';

// ** import handlers
import { getImageNodes } from '@/core/handlers/fetch-images-handler';
import { searchNodes } from '@/core/handlers/search-nodes-handler';
import { handleExportRequest } from '@/core/handlers/export-handler';

// ** import ai handlers
import { handleAIRenameRequest, applyRename } from '@/core/ai/rename-handler';

// ** import types
import { NodeData } from '@/types/node';
import { AINodeData } from '@/types/ai';
import {
  DeleteDataHandler,
  ExportAssetsHandler,
  FetchAIImageNodesHandler,
  FetchAILayerNodesHandler,
  FetchAINodesHandler,
  FetchImageNodesHandler,
  GetDataHandler,
  NotificationHandler,
  SearchNodesHandler,
  SetDataHandler,
  AIRenameRequestHandler,
  AIApplyRenameHandler,
  AIFocusNodeHandler,
} from '@/types/events';

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
 * Recursively collects nodes that have an IMAGE fill paint.
 * Mirrors what the Asset tab does but returns AINodeData instead of NodeData.
 */
async function collectImageFillNodes(
  node: SceneNode,
  out: AINodeData[]
): Promise<void> {
  const typesWithFills = [
    'RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR',
    'FRAME', 'GROUP', 'COMPONENT', 'INSTANCE', 'SHAPE_WITH_TEXT',
  ];

  if (typesWithFills.includes(node.type) && 'fills' in node && Array.isArray(node.fills)) {
    const fills = node.fills as ReadonlyArray<Paint>;
    if (fills.some((f) => f.type === 'IMAGE')) {
      out.push({ id: node.id, name: node.name, nodeType: node.type });
      // Don't recurse into image-fill nodes — the node itself is the asset
      return;
    }
  }

  if ('children' in node) {
    for (const child of node.children) {
      await collectImageFillNodes(child as SceneNode, out);
    }
  }
}

/**
 * Checks whether a node (or any of its descendants) contains an IMAGE fill.
 * Used by the Layers collector to exclude nodes that are already covered by
 * the Images sub-tab.
 */
function hasImageFill(node: SceneNode): boolean {
  if ('fills' in node && Array.isArray(node.fills)) {
    if ((node.fills as ReadonlyArray<Paint>).some((f) => f.type === 'IMAGE')) return true;
  }
  if ('children' in node) {
    for (const child of node.children) {
      if (hasImageFill(child as SceneNode)) return true;
    }
  }
  return false;
}

/**
 * For the AI Images sub-tab: recurse into the selection and collect every
 * node that has an IMAGE fill paint (same logic as the Asset tab).
 */
const fetchAndEmitAIImageNodes = async (nodes: ReadonlyArray<SceneNode>) => {
  const imageNodes: AINodeData[] = [];
  for (const node of nodes) {
    await collectImageFillNodes(node, imageNodes);
  }
  emit<FetchAIImageNodesHandler>('FETCH_AI_IMAGE_NODES', imageNodes);
};

/**
 * For the AI Layers sub-tab: emit the top-level selected nodes that are NOT
 * pure image-fill nodes (frames, groups, components, text nodes, etc.).
 * We exclude any node whose sole purpose is an IMAGE fill — those belong in
 * the Images sub-tab.
 */
const fetchAndEmitAILayerNodes = (nodes: ReadonlyArray<SceneNode>) => {
  const layerNodes: AINodeData[] = nodes
    .filter((node) => {
      // Exclude bare image-fill leaves (RECTANGLE / ELLIPSE / etc. with IMAGE fill
      // and no children that are containers) — those are Images-tab nodes.
      const isImageLeaf =
        ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR'].includes(node.type) &&
        'fills' in node &&
        Array.isArray(node.fills) &&
        (node.fills as ReadonlyArray<Paint>).some((f) => f.type === 'IMAGE');
      return !isImageLeaf;
    })
    .map((node) => ({ id: node.id, name: node.name, nodeType: node.type }));

  emit<FetchAILayerNodesHandler>('FETCH_AI_LAYER_NODES', layerNodes);
};

/**
 * Legacy: emits FETCH_AI_NODES (still listened to by ui.tsx for backward compat).
 */
const fetchAndEmitAllNodes = (nodes: ReadonlyArray<SceneNode>) => {
  const aiNodes: AINodeData[] = nodes.map((node) => ({
    id: node.id,
    name: node.name,
    nodeType: node.type,
  }));
  emit<FetchAINodesHandler>('FETCH_AI_NODES', aiNodes);
};

/**
 * Initializes the Figma plugin, and fetching initial nodes if any are selected.
 */
const initializePlugin = async () => {
  const selectedNodes = figma.currentPage.selection;
  await fetchAndEmitImageNodes(selectedNodes);
  await fetchAndEmitAIImageNodes(selectedNodes);
  fetchAndEmitAILayerNodes(selectedNodes);
};

void initializePlugin();

// Store the data in Figma's clientStorage
on<SetDataHandler>('SET_DATA', async ({ handle, data }) => {
  await figma.clientStorage.setAsync(handle, data);
});

// Retrieve the data from Figma's clientStorage
on<GetDataHandler>('GET_DATA', async ({ handle }) => {
  const data = await figma.clientStorage.getAsync(handle);
  emit('RECEIVE_DATA', { handle, data });
});

// Delete the data from Figma's clientStorage
on<DeleteDataHandler>('DELETE_DATA', async ({ handle }) => {
  await figma.clientStorage.deleteAsync(handle);
});

// ** Notification handler **
on<NotificationHandler>('NOTIFY', (message, type, timeout = 3000) => {
  let options: NotificationOptions = { timeout };

  switch (type) {
    case 'success':
      message = `✔️ ${message}`;
      break;
    case 'warn':
      message = `⚠️ ${message}`;
      break;
    case 'error':
      message = `✘ ${message}`;
      options.error = true; // Use Figma's error style
      break;
    case 'loading':
      message = `⏳ ${message}`;
      break;
  }

  figma.notify(message, options);
});

/**
 * Triggered when the node selection changes in Figma.
 */
figma.on('selectionchange', async () => {
  const selectedNodes = figma.currentPage.selection;
  await fetchAndEmitImageNodes(selectedNodes);
  await fetchAndEmitAIImageNodes(selectedNodes);
  fetchAndEmitAILayerNodes(selectedNodes);
});

on<SearchNodesHandler>('SEARCH_NODES', async (query) => {
  const allImageNodes: NodeData[] = await searchNodes(query);
  emit<FetchImageNodesHandler>('FETCH_IMAGE_NODES', allImageNodes);
});

on<ExportAssetsHandler>('EXPORT_ASSETS', async (data) => {
  await handleExportRequest(data);
});

// ** AI Rename handlers **

on<AIRenameRequestHandler>('AI_RENAME_REQUEST', async (payload) => {
  await handleAIRenameRequest(payload);
});

on<AIApplyRenameHandler>('AI_APPLY_RENAME', async ({ nodeId, suggestedName }) => {
  await applyRename(nodeId, suggestedName);
});

// Scroll to and select a node in Figma when its row is clicked in the AI tab
on<AIFocusNodeHandler>('AI_FOCUS_NODE', async (nodeId: string) => {
  try {
    const node = await figma.getNodeByIdAsync(nodeId) as SceneNode | null;
    if (node) {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  } catch {
    // node may have been deleted — silently ignore
  }
});
