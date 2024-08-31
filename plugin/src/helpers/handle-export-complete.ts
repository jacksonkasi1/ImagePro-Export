// ** import third-party libraries
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ** import helpers
import { arrayBufferToBase64, compressImage, renameFile } from '@/helpers/file-operation';

// ** import types
import { ImageData } from '@/types/utils';

// Proper interface for the function parameters
interface ExportCompleteParams {
  data: ImageData[];
  setIsLoading: (isLoading: boolean) => void;
  quality: number;
}

interface FileNames {
  [key: string]: Set<string>;
}

// Refactored function
export const handleExportComplete = async ({ data, setIsLoading, quality }: ExportCompleteParams) => {
  if (!data) return;

  try {
    const zip = new JSZip();
    const fileNames: FileNames = {};

    const base64Promises = data.map(async (image: ImageData) => {
      const { nodeName, scale, imageData, formatOption, caseOption } = image;
      const blob = new Blob([new Uint8Array(imageData)], {
        type: `image/${formatOption.toLowerCase()}`,
      });

      let processedBlob = blob;

      if (['JPG', 'PNG', 'WEBP'].includes(formatOption) && quality < 100) {
        processedBlob = await compressImage(blob, formatOption, quality);
      }

      const base64Image = await arrayBufferToBase64(
        new Uint8Array(await processedBlob.arrayBuffer()),
        formatOption
      );
      return { nodeName, scale, base64Image, exportOption: formatOption, caseOption };
    });

    const base64Images = await Promise.all(base64Promises);

    base64Images.forEach((image) => {
      const { nodeName, scale, base64Image, exportOption, caseOption } = image;
      const scaleFolder = `${scale}x/`;
      if (!fileNames[scaleFolder]) {
        fileNames[scaleFolder] = new Set();
      }

      let fileName = renameFile(
        nodeName,
        scale,
        exportOption,
        caseOption,
        fileNames[scaleFolder].size
      );

      while (fileNames[scaleFolder].has(fileName)) {
        fileName = renameFile(
          nodeName,
          scale,
          exportOption,
          caseOption,
          fileNames[scaleFolder].size + 1
        );
      }
      fileNames[scaleFolder].add(fileName);

      if (base64Image) {
        zip
          .folder(scaleFolder)
          ?.file(fileName, base64Image.split(',')[1], { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'exported_images.zip');
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};
