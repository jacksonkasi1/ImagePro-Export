// ** import helpers
import { arrayBufferToBase64, processFiles, renameFile, saveFiles } from '@/helpers/file-operation';

// ** import types
import { FileData, ImageData } from '@/types/utils';
import { ExportMode, PdfFormatOption, AssetsExportType } from '@/types/enums';

interface OtherExportsParams {
  data: ImageData[];
  exportMode: ExportMode;
  exportSettings: {
    quality: number;
    pdfFormatOption?: PdfFormatOption;
    password?: string;
    assetsExportType: AssetsExportType;
  };
}

export const handleOtherExports = async ({ data, exportMode, exportSettings }: OtherExportsParams) => {
  const { quality, pdfFormatOption, password } = exportSettings;

  const fileNames: FileData[] = [];

  // Process all files in parallel
  await Promise.all(
    data.map(async (item) => {
      const { nodeName, imageData, formatOption, caseOption } = item;

      // Process each file
      const processedBlob = await processFiles({
        imageData,
        formatOption,
        quality,
        pdfFormatOption,
        password,
      });

      // Convert processed buffer to base64
      const base64Data = await arrayBufferToBase64(new Uint8Array(await processedBlob.arrayBuffer()), formatOption);

      // Rename the file
      let fileName = renameFile({ name: nodeName, format: formatOption, caseOption });

      // Collect file data
      fileNames.push({ fileName, fileBlob: processedBlob, base64Data });
    })
  );

  // Use the utility function to handle file saving
  await saveFiles(fileNames, exportMode);
};
