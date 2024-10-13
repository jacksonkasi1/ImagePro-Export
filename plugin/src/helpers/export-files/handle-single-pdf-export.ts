// ** import lib
import notify from '@/lib/notify';

// ** import helpers
import { renameFile, saveFiles } from '@/helpers/file-operation';

// ** import types
import { ImageData } from '@/types/utils';
import { ExportMode, PdfFormatOption, AssetsExportType } from '@/types/enums';

// ** import config
import { config } from '@/config';


interface SinglePdfExportParams {
  data: ImageData[];
  exportMode: ExportMode;
  exportSettings: {
    quality: number;
    pdfFormatOption?: PdfFormatOption;
    password?: string;
    assetsExportType: AssetsExportType;
  };
}

export const handleSinglePdfExport = async ({ data, exportMode, exportSettings }: SinglePdfExportParams) => {
  const { pdfFormatOption, password } = exportSettings;

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

  // API URL for /merge-upload
  const apiUrl = `${config.FILE_SERVER}/api/pdf-opt/merge-upload`;

  // Perform the merging and password protection for PDF
  const response = await fetch(apiUrl, { method: 'POST', body: formData });

  if (!response.ok) {
    notify.error('PDF merge-upload API failed');
    console.error('PDF merge-upload API failed:', response.statusText);
    throw new Error('PDF merge-upload API failed');
  }

  const mergedPdfBlob = await response.blob();

  // Rename the merged PDF
  const mergedFileName = 'merged.pdf';

  // Use the utility function to handle file saving
  await saveFiles([{ fileName: mergedFileName, fileBlob: mergedPdfBlob }], exportMode);
};
