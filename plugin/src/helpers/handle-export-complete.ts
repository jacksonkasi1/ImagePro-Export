// ** import third-party libraries
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ** import helpers
import { arrayBufferToBase64, processFiles, renameFile, saveFile } from '@/helpers/file-operation';

// ** import types
import { ImageData } from '@/types/utils';
import { ExportMode, PdfFormatOption } from '@/types/enums';

interface ExportCompleteParams {
  data: ImageData[];
  setIsLoading: (isLoading: boolean) => void;
  quality: number;
  exportMode: ExportMode;
  pdfFormatOption?: PdfFormatOption;
  password?: string;
}

// Refactored function with parallel processing
export const handleExportComplete = async ({
  data,
  setIsLoading,
  quality,
  exportMode,
  pdfFormatOption,
  password,
}: ExportCompleteParams) => {
  if (!data) return;

  try {
    let zip: JSZip | undefined;
    if (exportMode === ExportMode.ZIP) {
      zip = new JSZip();
    }

    const fileNames = new Set<string>();

    // Process all files in parallel
    await Promise.all(
      data.map(async (image) => {
        const { nodeName, imageData, formatOption, caseOption } = image;

        // Process each file
        const processedBlob = await processFiles({
          imageData,
          formatOption,
          quality,
          pdfFormatOption,
          password,
        });

        // Convert processed image to base64
        const base64Image = await arrayBufferToBase64(new Uint8Array(await processedBlob.arrayBuffer()), formatOption);

        // Rename the file
        let fileName = renameFile({ name: nodeName, format: formatOption, caseOption });
        while (fileNames.has(fileName)) {
          fileName = renameFile({ name: nodeName, format: formatOption, caseOption, count: fileNames.size + 1 });
        }
        fileNames.add(fileName);

        // Save the file (in ZIP or individually)
        await saveFile(fileName, processedBlob, exportMode, zip, base64Image);
      })
    );

    // If export mode is ZIP, generate and download the ZIP file
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
