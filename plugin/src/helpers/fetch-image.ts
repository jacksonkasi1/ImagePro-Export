// ** import types
import { NodeData, NodeType } from "@/types/node";

export function getImageNodes(node: SceneNode, allNodes: NodeData[]) {
  // Node types that can potentially have image fills
  const typesWithFills = [
    "RECTANGLE",
    "ELLIPSE",
    "POLYGON",
    "STAR",
    "VECTOR",
    "FRAME",
    "GROUP",
    "COMPONENT",
    "INSTANCE",
    "SHAPE_WITH_TEXT",
  ];

  // Check if the node is one of the types that can have fills and has image fills
  if (
    typesWithFills.includes(node.type) &&
    "fills" in node &&
    Array.isArray(node.fills)
  ) {
    const fills = node.fills as ReadonlyArray<Paint>;
    const imageFill = fills.find((fill) => fill.type === "IMAGE");
    if (imageFill) {
      allNodes.push({
        id: node.id,
        name: node.name,
        type: "IMAGE" as NodeType,
        imageData: (imageFill as ImagePaint).imageHash as string, // Added imageData
      });
    }
  }

  // Recursively check children nodes
  if ("children" in node) {
    node.children.forEach((child) => getImageNodes(child, allNodes));
  }
}
