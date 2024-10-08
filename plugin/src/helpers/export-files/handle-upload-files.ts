// ** import helpers & utils
import { renameFile, getMimeType } from '@/helpers/file-operation';

// ** import config
import { config } from '@/config';

// ** import types
import { ImageData } from '@/types/utils';
import { AssetsExportType, PdfFormatOption } from '@/types/enums';

interface UploadFilesParams {
  data: ImageData[];
  exportSettings: {
    quality: number;
    pdfFormatOption?: PdfFormatOption;
    password?: string;
    assetsExportType: AssetsExportType;
  };
}

export const handleUploadFiles = async ({ data, exportSettings }: UploadFilesParams) => {
  const { pdfFormatOption, password } = exportSettings;

  const formDataForFile = async (file: ImageData): Promise<FormData> => {
    const mimeType = getMimeType(file.formatOption); // Use utility function to get MIME type
    const blob = new Blob([new Uint8Array(file.imageData)], { type: mimeType });
    const fileName = renameFile({ name: file.nodeName, format: file.formatOption, caseOption: file.caseOption });

    const formData = new FormData();
    formData.append('file', blob, `${fileName}.${file.formatOption.toLowerCase()}`);

    if (pdfFormatOption) formData.append('colorMode', pdfFormatOption);
    if (password) formData.append('password', password);

    return formData;
  };

  // Parallel file uploads
  const uploadPromises = data.map(async (file) => {
    const formData = await formDataForFile(file);
    
    // Upload each file individually
    const response = await fetch(`${config.FILE_SERVER}/api/upload-opt/files-upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error(`File upload failed for ${file.nodeName}`);

    const result = await response.json();
    return { nodeName: file.nodeName, cid: result.cid };
  });

  // Wait for all uploads to finish and map CIDs to nodeNames
  const uploadResults = await Promise.all(uploadPromises);

  // Map each CID with the corresponding nodeName
  const fileCidMap = uploadResults.reduce((map, { nodeName, cid }) => {
    map[nodeName] = cid;
    return map;
  }, {} as Record<string, string>);

  console.log('File CID Map:', fileCidMap);
};
