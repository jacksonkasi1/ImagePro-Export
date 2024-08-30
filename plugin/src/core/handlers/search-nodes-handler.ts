// ** import types
import { NodeData, NodeType } from '@/types/node';

// ** import handlers
import { getImageNodes } from './fetch-images-handler';

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
    // Convert node name and query to lowercase for case-insensitive search
    if (node.name.toLowerCase().includes(query.toLowerCase())) {
      const imageUrl = await node.exportAsync(exportSize('HEIGHT', 150));
      allNodes.push({
        id: node.id,
        name: node.name,
        type: node.type as NodeType,
        imageData: imageUrl,
        dimensions: {
          height: node.height,
          width: node.width,
        }
      });
    }

    // Recursively search through children nodes if the current node has children
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
