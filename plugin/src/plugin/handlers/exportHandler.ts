import { getScaleValues } from '@/helpers/common';
import { ExportSettingsImage, ExportSettingsPDF, ExportSettingsSVG } from '@/types/export-settings';

export const handleExportRequest = async (data) => {
  const { selectedNodeIds, exportOption, exportScaleOption, caseOption } = data;
  const scales = getScaleValues(exportScaleOption);
  const images = [];

  for (const nodeId of selectedNodeIds) {
    const node = figma.getNodeById(nodeId) as SceneNode;
    if (node) {
      for (const scale of scales) {
        let exportSettings: ExportSettings;

        switch (exportOption) {
          case 'PDF':
            exportSettings = { format: 'PDF' } as ExportSettingsPDF;
            break;
          case 'SVG':
            exportSettings = { format: 'SVG' } as ExportSettingsSVG;
            break;
          case 'PNG':
          case 'JPG':
            exportSettings = {
              format: exportOption,
              constraint: { type: 'SCALE', value: scale },
            } as ExportSettingsImage;
            break;
          default:
            continue; // Skip unsupported formats like WEBP
        }

        const imageData = await node.exportAsync(exportSettings);
        images.push({
          nodeName: node.name,
          scale,
          imageData: Array.from(imageData),
          exportOption,
          caseOption,
        });
      }
    }
  }

  figma.ui.postMessage({ type: 'EXPORT_COMPLETE', data: images });
};
