// ** import helpers & utils
import { renameFile, getMimeType } from '@/helpers/file-operation';

// ** import config
import { config } from '@/config';

// ** import types
import { ImageData } from '@/types/utils';
import { AssetsExportType, PdfFormatOption } from '@/types/enums';

// ** import hooks & store
import { useHistoryStore } from '@/store/use-history-store';
import { useUtilsStore } from '@/store/use-utils-store';

// ** import lib
import notify from '@/lib/notify';

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

  const { toggleHistory } = useUtilsStore.getState();
  const addHistoryItem = useHistoryStore.getState().addHistoryItem; // Use the addHistoryItem function from the store

  const formDataForFile = async (file: ImageData): Promise<FormData> => {
    const mimeType = getMimeType(file.formatOption); // Use utility function to get MIME type
    const blob = new Blob([new Uint8Array(file.imageData)], { type: mimeType });
    const fileName = renameFile({ name: file.nodeName, format: file.formatOption, caseOption: file.caseOption });

    const formData = new FormData();
    formData.append('file', blob, `${fileName}.${file.formatOption.toLowerCase()}`);

    if (pdfFormatOption) formData.append('colorMode', pdfFormatOption);
    if (password) formData.append('password', password);
    formData.append('thumbnail', 'true'); // Generate thumbnail for image files

    return formData;
  };

  try {
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

      // Determine file type based on formatOption
      const fileType: 'image' | 'pdf' = ['JPG', 'PNG', 'WEBP'].includes(file.formatOption) ? 'image' : 'pdf';
      return {
        ...result, // Spread result to include cid, thumbnail_cid, file_id, and thumbnail_id
        nodeName: file.nodeName,
        dimensions: file.dimensions,
        type: file.type,
        file_type: fileType,
      };
    });

    // Wait for all uploads to finish and map CIDs to nodeNames
    const uploadResults = await Promise.all(uploadPromises);

    // Add the uploaded files to history with thumbnail_cid and file_type
    uploadResults.forEach((result) => {
      addHistoryItem({ ...result, name: result.nodeName });
    });

    // Notify success and toggle history view
    notify.success('Files uploaded and added to history successfully!');
    toggleHistory();
  } catch (error: any) {
    // Notify error on any failure
    notify.error(error.message || 'An error occurred during the file upload process.');
  }
};
