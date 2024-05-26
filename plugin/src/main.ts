import { emit, on, showUI } from "@create-figma-plugin/utilities";

// ** import types
import { ResizeWindowHandler } from "@/types/events";
import { NodeData } from "@/types/node";

// ** import helpers
import { getImageNodes } from "@/helpers/fetch-image";

export default function () {
  on<ResizeWindowHandler>(
    "RESIZE_WINDOW",
    function (windowSize: { width: number; height: number }) {
      const { width, height } = windowSize;
      figma.ui.resize(width, height);
    },
  );
  showUI({
    height: 600, // Initial height
    width: 800, // Initial width
  });

  /**
   * Trigger Auto select by selectionchange
   */
  figma.on("selectionchange", () => {
    console.log("selectionchange event triggered");
    const selectedNodes = figma.currentPage.selection;

    selectedNodes.forEach((node) => {
      const parentName = node.parent ? node.parent.name : "None";
      console.log(
        `Node ID: ${node.id}, Node Type: ${node.type}, Parent Name: ${parentName}`,
      );
    });

    const allImageNodes: NodeData[] = [];
    selectedNodes.forEach((node) => getImageNodes(node, allImageNodes));
    console.log(allImageNodes.length);

    emit("FETCH_IMAGE_NODES", allImageNodes);
  });
}
