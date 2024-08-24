// ** import types
import { NodeData, NodeType } from '@/types/node';

// ** import handlers
import { getImageNodes } from './fetchImagesHandlers';

// Define the export size settings
const exportSize = (type: 'SCALE' | 'HEIGHT', value: number): ExportSettings => ({
  format: 'JPG',
  constraint: { type, value },
});

export async function searchNodes(query: string): Promise<NodeData[]> {
  const allNodes: NodeData[] = [];
  const currentPageSelection = figma.currentPage.selection;

  if (query === '') {
    for (const node of currentPageSelection) {
      await getImageNodes(node, allNodes);
    }
    return allNodes;
  }

  async function searchNode(node: SceneNode) {
    if (node.name.toLowerCase().startsWith(query.toLowerCase())) {
      const imageUrl = await node.exportAsync(exportSize('HEIGHT', 150));
      allNodes.push({
        id: node.id,
        name: node.name,
        type: node.type as NodeType,
        imageData: imageUrl,
      });
    }

    if ('children' in node) {
      for (const child of node.children) {
        await searchNode(child);
      }
    }
  }

  for (const node of currentPageSelection) {
    await searchNode(node);
  }

  return allNodes;
}
