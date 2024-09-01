// ** import figma utils
import { emit } from '@create-figma-plugin/utilities';

// ** import helpers
import { getScaleValues } from '@/helpers/common';

// ** import types
import { ExportCompleteHandler } from '@/types/events';
import { ExportRequestData, ExportSettingsImage, ExportSettingsPDF, ExportSettingsSVG } from '@/types/export-settings';
import { FormatOption } from '@/types/enums';

export const handleExportRequest = async (data: ExportRequestData) => {
  const { selectedNodeIds, formatOption, exportScaleOption, caseOption } = data;

  const scales: number[] = getScaleValues(exportScaleOption);
  const images: Array<{
    nodeName: string;
    scale: number;
    imageData: number[];
    formatOption: FormatOption;
    caseOption: string;
  }> = [];

  for (const nodeId of selectedNodeIds) {
    let node: SceneNode | null; // Initialize as null to handle cases where node is not found
    try {
      // Ensure `getNodeByIdAsync` correctly typed and returns `SceneNode` or null
      node = await figma.getNodeByIdAsync(nodeId) as SceneNode | null; 
    } catch (error) {
      console.error(`Failed to get node with ID ${nodeId}:`, error);
      continue; // Skip this iteration if an error occurs
    }

    if (node) {
      for (const scale of scales) {
        let exportSettings: ExportSettings;
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
            console.error(`Unsupported format option: ${formatOption}`);
            continue; // Skip unsupported formats
        }

        try {
          const imageData = await node.exportAsync(exportSettings);
          images.push({
            nodeName: node.name,
            scale,
            imageData: Array.from(imageData),
            formatOption,
            caseOption,
          });
        } catch (error) {
          console.error(`Failed to export node ${nodeId} with scale ${scale}:`, error);
        }
      }
    }
  }
  
  emit<ExportCompleteHandler>('EXPORT_COMPLETE', images);
};
