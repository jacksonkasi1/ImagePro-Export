// ** import helpers
import { getImageNodes } from "@/helpers/fetch-image";

// ** import types
import { NodeData } from "@/types/node";

// ** import figma handlers
import { handleExportRequest } from "./handlers/exportHandler";

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
