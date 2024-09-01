// ** import figma utils
import { emit } from '@create-figma-plugin/utilities';

// ** import helpers
import { getScaleValues } from '@/helpers/common';

// ** import types
import { ExportCompleteHandler } from '@/types/events';
import { ExportRequestData, ExportSettingsImage, ExportSettingsPDF, ExportSettingsSVG } from '@/types/export-settings';

export const handleExportRequest = async (data: ExportRequestData) => {
  const { selectedNodeIds, formatOption, exportScaleOption, caseOption } = data;
  const scales = getScaleValues(exportScaleOption);
  const images = [];

  for (const nodeId of selectedNodeIds) {
    let node: SceneNode | null;

    try {
      node = await figma.getNodeByIdAsync(nodeId) as SceneNode | null;
    } catch (error) {
      console.error(`Failed to get node with ID ${nodeId}:`, error);
      continue;
    }

    if (!node) {
      console.warn(`No node found with ID ${nodeId}`);
      continue;
    }

    for (const scale of scales) {
      let exportSettings: ExportSettings;

      try {
        switch (formatOption) {
          case 'PDF':
            exportSettings = { format: 'PDF' } as ExportSettingsPDF;
            break;
          case 'SVG':
            exportSettings = { format: 'SVG' } as ExportSettingsSVG;
            break;
          case 'PNG':
          case 'JPG':
            exportSettings = {
              format: formatOption,
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
            console.warn(`Unsupported format: ${formatOption}`);
            continue;
        }
      } catch (error) {
        console.error(`Failed to set export settings for node with ID ${nodeId}:`, error);
        continue;
      }

      let imageData: Uint8Array;

      try {
        imageData = await node.exportAsync(exportSettings);
      } catch (error) {
        console.error(`Failed to export node with ID ${nodeId}:`, error);
        continue;
      }

      images.push({
        nodeName: node.name,
        scale,
        imageData: Array.from(imageData),
        formatOption,
        caseOption,
      });
    }
  }

  try {
    emit<ExportCompleteHandler>('EXPORT_COMPLETE', images);
  } catch (error) {
    console.error('Failed to emit export complete event:', error);
  }
};
