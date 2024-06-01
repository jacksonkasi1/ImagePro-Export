// ** import types
import { NodeData, NodeType } from "@/types/node";

export async function getImageNodes(node: SceneNode, allNodes: NodeData[]) {
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

  if (
    typesWithFills.includes(node.type) &&
    "fills" in node &&
    Array.isArray(node.fills)
  ) {
    const fills = node.fills as ReadonlyArray<Paint>;
    const imageFill = fills.find((fill) => fill.type === "IMAGE");
    if (imageFill) {
      const imageHash = (imageFill as ImagePaint).imageHash as string;
      if (imageHash) {
        const imageUrl = await figma.getImageByHash(imageHash).getBytesAsync();
        if (imageUrl) {
          allNodes.push({
            id: node.id,
            name: node.name,
            type: "IMAGE" as NodeType,
            imageData: imageUrl,
          });
        }
      }
    }
  }

  if ("children" in node) {
    for (const child of node.children) {
      await getImageNodes(child, allNodes);
    }
  }
}
