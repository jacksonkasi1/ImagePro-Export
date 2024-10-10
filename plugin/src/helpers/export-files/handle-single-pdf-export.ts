// ** import third-party libraries
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ** import helpers
import { renameFile } from '@/helpers/file-operation';

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
  const { quality, pdfFormatOption, password } = exportSettings;

  let zip: JSZip | undefined;
  if (exportMode === ExportMode.ZIP) {
    zip = new JSZip();
  }

  const fileNames = new Set<string>();

  // Filter images that need to be merged into a single PDF
  const singlePdfImages = data.filter((image) => image.formatOption === 'PDF');

  if (singlePdfImages.length === 0) {
    throw new Error('No PDF images found for SINGLE export.');
  }

  const formData = new FormData();

  singlePdfImages.forEach((image) => {
    const blob = new Blob([new Uint8Array(image.imageData)], { type: 'application/pdf' });
    const fileName = renameFile({ name: image.nodeName, format: image.formatOption, caseOption: image.caseOption });
    formData.append('files', blob, `${fileName}.pdf`);
  });

  if (pdfFormatOption) {
    formData.append('colorMode', pdfFormatOption);
  }
  if (password) {
    formData.append('password', password);
  }

  // API URL for /merge-upload
  const apiUrl = `${config.FILE_SERVER}/api/pdf-opt/merge-upload`;

  // Perform the merging and password protection for PDF
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    console.error('PDF merge-upload API failed:', response.statusText);
    throw new Error('PDF merge-upload API failed');
  }

  const mergedPdfBlob = await response.blob();

  // Rename and save the merged PDF
  let mergedFileName = 'merged.pdf';
  let counter = 1;
  while (fileNames.has(mergedFileName)) {
    // If the file name already exists, append a number to the end
    mergedFileName = `merged_${counter}.pdf`;
    counter++;
  }
  fileNames.add(mergedFileName);

  if (exportMode === ExportMode.ZIP && zip) {
    zip.file(mergedFileName, mergedPdfBlob);
  } else {
    saveAs(mergedPdfBlob, mergedFileName);
  }

  // If export mode is ZIP, generate and download the ZIP file
  if (exportMode === ExportMode.ZIP && zip) {
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'exported_files.zip');
  }
};
