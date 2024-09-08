// ** import figma utils
import { emit } from '@create-figma-plugin/utilities';

// ** import helpers
import { getScaleValues } from '@/helpers/common';

// ** import types
import { FormatOption, PdfFormatOption } from '@/types/enums';
import { ExportCompleteHandler } from '@/types/events';
import { ExportRequestData, ExportSettingsImage, ExportSettingsPDF, ExportSettingsSVG } from '@/types/export-settings';

export const handleExportRequest = async (data: ExportRequestData) => {
  const { selectedNodeIds, formatOption, exportScaleOption, caseOption, pdfFormatOption } = data;

  const scales: number[] = getScaleValues(exportScaleOption);
  const images: Array<{
    nodeName: string;
    scale: number;
    imageData: number[];
    formatOption: FormatOption;
    caseOption: string;
  }> = [];

  for (const nodeId of selectedNodeIds) {
    let node: SceneNode | null;
    try {
      node = (await figma.getNodeByIdAsync(nodeId)) as SceneNode | null;
    } catch (error) {
      console.error('Failed to get node with ID:', nodeId, error);
      continue;
    }

    if (node) {
      for (const scale of scales) {
        let exportSettings: ExportSettings;
        switch (formatOption) {
          case 'PDF':
            if (pdfFormatOption === PdfFormatOption.CYMK || pdfFormatOption === PdfFormatOption.Grayscale) {
              exportSettings = { format: 'JPG' } as ExportSettingsImage;
              break;
            }
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
              format: 'JPG',
              constraint: { type: 'SCALE', value: scale },
            } as ExportSettingsImage;
            break;
          default:
            console.error('Unsupported format option:', formatOption);
            continue;
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
          console.error('Failed to export node with ID:', nodeId, 'with scale', scale, error);
        }
      }
    }
  }

  emit<ExportCompleteHandler>('EXPORT_COMPLETE', images);
};
