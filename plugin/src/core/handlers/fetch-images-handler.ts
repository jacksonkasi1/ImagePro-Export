// ** import types
import { NodeData, NodeType } from '@/types/node';

// Define the export size settings
const exportSize = (type: 'SCALE' | 'HEIGHT', value: number): ExportSettings => ({
  format: 'JPG',
  constraint: { type, value },
});

export async function getImageNodes(node: SceneNode, allNodes: NodeData[]) {
  try {
    // Define the types with fills to be processed
    const typesWithFills = [
      'RECTANGLE',
      'ELLIPSE',
      'POLYGON',
      'STAR',
      'VECTOR',
      'FRAME',
      'GROUP',
      'COMPONENT',
      'INSTANCE',
      'SHAPE_WITH_TEXT',
    ]; // Add more/remove types as needed

    if (typesWithFills.includes(node.type) && 'fills' in node && Array.isArray(node.fills)) {
      const fills = node.fills as ReadonlyArray<Paint>;
      const imageFill = fills.find((fill) => fill.type === 'IMAGE');
      if (imageFill) {
        try {
          const imageUrl = await node.exportAsync(exportSize('HEIGHT', 150));
          allNodes.push({
            id: node.id,
            name: node.name,
            type: 'IMAGE' as NodeType,
            imageData: imageUrl,
            dimensions: {
              width: node.width,
              height: node.height,
            },
          });
        } catch (error) {
          console.error(`Failed to export image for node ${node.id}:`, error);
        }
      }
    }

    if ('children' in node) {
      for (const child of node.children) {
        await getImageNodes(child, allNodes); // Recursive call with error handling
      }
    }
  } catch (error) {
    console.error(`Error processing node ${node.id}:`, error);
  }
}
