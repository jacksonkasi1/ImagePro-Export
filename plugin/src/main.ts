import { emit, showUI } from '@create-figma-plugin/utilities';
import { NodeData } from './types/node';
import { getImageNodes } from './core/handlers/fetch-images-handlers';
import { FetchImageNodesHandler } from './types/events';

export default function () {
  showUI({
    height: 540, // min - 540
    width: 320, // min - 320
  });
}

/**
 * Triggered when the node selection changes in Figma. Fetches image nodes for the selected nodes.
 */
figma.on('selectionchange', async () => {
  const selectedNodes = figma.currentPage.selection;
  const allImageNodes: NodeData[] = [];

  for (const node of selectedNodes) {
    await getImageNodes(node, allImageNodes);
  }

  emit<FetchImageNodesHandler>('FETCH_IMAGE_NODES', allImageNodes);
});
