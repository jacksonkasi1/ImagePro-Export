// ** import helpers
import { getImageNodes } from '@/helpers/fetch-image';

// ** import types
import { NodeData } from '@/types/node';

figma.showUI(__html__, { width: 800, height: 600 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'resize') {
    const width = Math.max(640, Math.min(1000, msg.width));
    const height = Math.max(160, Math.min(1000, msg.height));
    figma.ui.resize(width, height);
  }
};

/**
 * Trigger Auto select by selectionchange
 */
figma.on('selectionchange', () => {
  const selectedNodes = figma.currentPage.selection;

  // selectedNodes.forEach((node) => {
  //   const parentName = node.parent ? node.parent.name : 'None';
  //   console.log(`Node ID: ${node.id}, Node Type: ${node.type}, Parent Name: ${parentName}`);
  // });

  const allImageNodes: NodeData[] = [];
  selectedNodes.forEach((node) => getImageNodes(node, allImageNodes));

  // Send data to the UI
  figma.ui.postMessage({ type: 'FETCH_IMAGE_NODES', data: allImageNodes });
});
