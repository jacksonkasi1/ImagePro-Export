// ** import helpers & utils
import { renameFile } from '@/helpers/file-operation';

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

interface UploadSinglePdfParams {
  data: ImageData[];
  exportSettings: {
    quality: number;
    pdfFormatOption?: PdfFormatOption;
    password?: string;
    assetsExportType: AssetsExportType;
  };
}

export const handleUploadSinglePdf = async ({ data, exportSettings }: UploadSinglePdfParams) => {
  const { pdfFormatOption, password } = exportSettings;

  const { toggleHistory } = useUtilsStore.getState();
  const addHistoryItem = useHistoryStore.getState().addHistoryItem; // Use the addHistoryItem function from the store

  // Filter files that need to be merged into a single PDF
  const singlePdfFiles = data.filter((item) => item.formatOption === 'PDF');

  if (singlePdfFiles.length === 0) {
    throw new Error('No PDF file found for SINGLE export.');
  }

  const formData = new FormData();

  singlePdfFiles.forEach((item) => {
    const blob = new Blob([new Uint8Array(item.imageData)], { type: 'application/pdf' });
    const fileName = renameFile({ name: item.nodeName, format: item.formatOption, caseOption: item.caseOption });
    formData.append('files', blob, `${fileName}.pdf`);
  });

  if (pdfFormatOption) formData.append('colorMode', pdfFormatOption);
  if (password) formData.append('password', password);

  // API URL for /merge-and-upload
  const apiUrl = `${config.FILE_SERVER}/api/upload-opt/merge-and-upload`;

  try {
    // Perform the merging and upload to Pinata
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      notify.error('PDF merge upload failed');
      console.error('PDF merge-upload API failed:', response.statusText);
      throw new Error('PDF merge-upload API failed');
    }

    const result = await response.json();

    // Determine file type as 'pdf'
    const fileType: 'pdf' = 'pdf';

    // Add the uploaded file to history with thumbnail_cid and file_type
    addHistoryItem({
      ...result, // Spread result to include cid, thumbnail_cid, file_id, and thumbnail_id
      name: singlePdfFiles[0].nodeName, // Use the nodeName from the first PDF
      dimensions: singlePdfFiles[0].dimensions,
      type: singlePdfFiles[0].type,
      file_type: fileType,
    });

    // Notify success and toggle history view
    notify.success('File uploaded and added to history successfully!');
    toggleHistory();

  } catch (error: any) {
    // Notify error on any failure
    notify.error(error.message || 'An error occurred during the file upload process.');
  }
};
