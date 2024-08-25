import { getScaleValues } from '@/helpers/common';
import { ExportSettingsImage, ExportSettingsPDF, ExportSettingsSVG } from '@/types/export-settings';

// Define an interface for the data parameter
interface ExportRequestData {
  selectedNodeIds: string[];
  exportOption: 'PDF' | 'SVG' | 'PNG' | 'JPG' | 'WEBP';
  exportScaleOption: string; // scale options
  caseOption: string; // options for caseOption
}

export const handleExportRequest = async (data: ExportRequestData) => {
  const { selectedNodeIds, exportOption, exportScaleOption, caseOption } = data;
  const scales = getScaleValues(exportScaleOption);
  const images = [];

  for (const nodeId of selectedNodeIds) {
    const node = (await figma.getNodeByIdAsync(nodeId)) as SceneNode;
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
          case 'WEBP':
            exportSettings = {
              format: 'JPG', // Use JPG as default
              constraint: { type: 'SCALE', value: scale },
            } as ExportSettingsImage;
            break;
          default:
            continue; // Skip unsupported formats
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
