// ** import types
import { NodeData } from '@/types/node';

// ** import figma handlers
import { handleExportRequest } from './handlers/exportHandler';
import { getImageNodes } from './handlers/fetchImagesHandlers';
import { searchNodes } from './handlers/searchNodesHandler';

// figma.showUI(__html__, { width: 570, height: 540 });


const initializePlugin = async () => {
  const storedWidth = await figma.clientStorage.getAsync('pluginWidth');
  const storedHeight = await figma.clientStorage.getAsync('pluginHeight');
  const width = storedWidth ? storedWidth : 570;
  const height = storedHeight ? storedHeight : 540;
  figma.showUI(__html__, { width, height });

  figma.ui.postMessage({ type: 'INITIAL_DIMENSIONS', data: { width, height } });
};

initializePlugin();

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'resize') {
    const width = Math.max(470, Math.min(1000, msg.width));
    const height = Math.max(360, Math.min(1000, msg.height));
    figma.ui.resize(width, height);
    await figma.clientStorage.setAsync('pluginWidth', width);
    await figma.clientStorage.setAsync('pluginHeight', height);
  } else if (msg.type === 'EXPORT_IMAGES') {
    handleExportRequest(msg.data);
  } else if (msg.type === 'SEARCH_NODES') {
    const allImageNodes: NodeData[] = await searchNodes(msg.data);
    figma.ui.postMessage({ type: 'FETCH_IMAGE_NODES', data: allImageNodes });
  }
};

/**
 * Trigger Auto select by selectionchange
 */
figma.on('selectionchange', async () => {
  const selectedNodes = figma.currentPage.selection;
  const allImageNodes: NodeData[] = [];

  for (const node of selectedNodes) {
    await getImageNodes(node, allImageNodes);
  }

  figma.ui.postMessage({ type: 'FETCH_IMAGE_NODES', data: allImageNodes });
});
