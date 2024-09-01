// ** import third-party libraries
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ** import helpers
import { arrayBufferToBase64, compressImage, renameFile } from '@/helpers/file-operation';

// ** import types
import { ImageData } from '@/types/utils';
import { ExportMode, FormatOption } from '@/types/enums';

interface ExportCompleteParams {
  data: ImageData[];
  setIsLoading: (isLoading: boolean) => void;
  quality: number;
  exportMode: ExportMode;
}

// Helper function to process and compress image
const processImage = async (imageData: number[], formatOption: FormatOption, quality: number): Promise<Blob> => {
  const blob = new Blob([new Uint8Array(imageData)], {
    type: `image/${formatOption.toLowerCase()}`,
  });

  if (['JPG', 'PNG', 'WEBP'].includes(formatOption) && quality < 100) {
    return await compressImage(blob, formatOption, quality);
  }

  return blob;
};

// Helper function to handle file saving logic
const saveFile = async (
  fileName: string,
  imageData: Blob,
  exportMode: ExportMode,
  zip?: JSZip,
  base64Image?: string
) => {
  if (exportMode === ExportMode.ZIP && zip && base64Image) {
    zip.file(fileName, base64Image.split(',')[1], { base64: true });
  } else if (exportMode === ExportMode.RAW) {
    saveAs(imageData, fileName);
  }
};

// Refactored function
export const handleExportComplete = async ({ data, setIsLoading, quality, exportMode }: ExportCompleteParams) => {
  if (!data) return;

  try {
    let zip: JSZip | undefined;
    if (exportMode === ExportMode.ZIP) {
      zip = new JSZip();
    }

    const fileNames = new Set<string>();

    for (const image of data) {
      const { nodeName, imageData, formatOption, caseOption } = image;
      const processedBlob = await processImage(imageData, formatOption, quality);

      const base64Image = await arrayBufferToBase64(new Uint8Array(await processedBlob.arrayBuffer()), formatOption);
      let fileName = renameFile({ name: nodeName, format: formatOption, caseOption });

      while (fileNames.has(fileName)) {
        fileName = renameFile({ name: nodeName, format: formatOption, caseOption, count: fileNames.size + 1 });
      }
      fileNames.add(fileName);

      await saveFile(fileName, processedBlob, exportMode, zip, base64Image);
    }

    if (exportMode === ExportMode.ZIP && zip) {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'exported_images.zip');
    }
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};
