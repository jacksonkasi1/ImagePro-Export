// ** import third-party libraries
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ** import helpers
import { arrayBufferToBase64, compressImage, renameFile } from '@/helpers/file-operation';

// ** import types
import { ImageData } from '@/types/utils';

interface ExportCompleteParams {
  data: ImageData[];
  setIsLoading: (isLoading: boolean) => void;
  quality: number;
  exportMode: 'ZIP' | 'FOLDER' | 'RAW'; // New export mode parameter
}

// Refactored function

export const handleExportComplete = async ({ data, setIsLoading, quality, exportMode }: ExportCompleteParams) => {
  if (!data) return;

  try {
    if (exportMode === 'ZIP') {
      const zip = new JSZip();
      const fileNames = new Set<string>();

      const base64Promises = data.map(async (image: ImageData) => {
        const { nodeName, imageData, formatOption, caseOption } = image;
        const blob = new Blob([new Uint8Array(imageData)], {
          type: `image/${formatOption.toLowerCase()}`,
        });

        let processedBlob = blob;

        if (['JPG', 'PNG', 'WEBP'].includes(formatOption) && quality < 100) {
          processedBlob = await compressImage(blob, formatOption, quality);
        }

        const base64Image = await arrayBufferToBase64(new Uint8Array(await processedBlob.arrayBuffer()), formatOption);
        return { nodeName, base64Image, exportOption: formatOption, caseOption };
      });

      const base64Images = await Promise.all(base64Promises);

      base64Images.forEach((image) => {
        const { nodeName, base64Image, exportOption, caseOption } = image;

        // Update usage to match new function signature
        let fileName = renameFile({ name: nodeName, format: exportOption, caseOption });

        while (fileNames.has(fileName)) {
          fileName = renameFile({ name: nodeName, format: exportOption, caseOption, count: fileNames.size + 1 });
        }
        fileNames.add(fileName);

        if (base64Image) {
          zip.file(fileName, base64Image.split(',')[1], { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'exported_images.zip');
    } else if (exportMode === 'FOLDER') {
      // Implement folder-based download logic here, if feasible
    } else if (exportMode === 'RAW') {
      // Directly download each file without zip or folder
      data.forEach(async (image) => {
        const { nodeName, imageData, formatOption, caseOption } = image;
        const blob = new Blob([new Uint8Array(imageData)], {
          type: `image/${formatOption.toLowerCase()}`,
        });

        let processedBlob = blob;

        if (['JPG', 'PNG', 'WEBP'].includes(formatOption) && quality < 100) {
          processedBlob = await compressImage(blob, formatOption, quality);
        }

        const fileName = renameFile({ name: nodeName, format: formatOption, caseOption });
        saveAs(processedBlob, fileName);
      });
    }
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};
