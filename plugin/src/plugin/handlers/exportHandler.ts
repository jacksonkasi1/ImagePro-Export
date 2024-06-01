// ** import helpers
import { getScaleValues } from "@/helpers/common";

export const handleExportRequest = async (data) => {
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
