// ** import helpers
import { getImageNodes } from "@/helpers/fetch-image";
import { getScaleValues } from "@/helpers/common";

// ** import types
import { NodeData } from "@/types/node";

figma.showUI(__html__, { width: 570, height: 540 });

figma.ui.onmessage = (msg) => {
  if (msg.type === "resize") {
    const width = Math.max(570, Math.min(1000, msg.width));
    const height = Math.max(360, Math.min(1000, msg.height));
    figma.ui.resize(width, height);
  } else if (msg.type === "EXPORT_IMAGES") {
    handleExportRequest(msg.data);
  }
};

/**
 * Trigger Auto select by selectionchange
 */

figma.on("selectionchange", async () => {
  const selectedNodes = figma.currentPage.selection;
  const allImageNodes: NodeData[] = [];

  for (const node of selectedNodes) {
    await getImageNodes(node, allImageNodes);
  }

  figma.ui.postMessage({ type: "FETCH_IMAGE_NODES", data: allImageNodes });
});

const handleExportRequest = async (data) => {
  const { selectedNodeIds, exportOption, exportScaleOption, caseOption } = data;
  const scales = getScaleValues(exportScaleOption);
  const images = [];

  for (const nodeId of selectedNodeIds) {
    const node = figma.getNodeById(nodeId) as SceneNode;
    if (node) {
      for (const scale of scales) {
        const exportSettings: ExportSettings = {
          format: exportOption,
          constraint: { type: "SCALE", value: scale },
        };
        const imageData = await node.exportAsync(exportSettings);
        images.push({
          nodeName: node.name,
          scale,
          imageData: Array.from(imageData), // Convert Uint8Array to Array for safe transfer
          exportOption,
          caseOption,
        });
      }
    }
  }

  figma.ui.postMessage({ type: "EXPORT_COMPLETE", data: images });
};
