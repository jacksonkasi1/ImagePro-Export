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
    const node = (await figma.getNodeByIdAsync(nodeId)) as SceneNode;
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
            continue; // Skip unsupported formats
        }

        const imageData = await node.exportAsync(exportSettings);
        images.push({
          nodeName: node.name,
          scale,
          imageData: Array.from(imageData),
          formatOption,
          caseOption,
        });
      }
    }
  }
  emit<ExportCompleteHandler>('EXPORT_COMPLETE', images);
};
