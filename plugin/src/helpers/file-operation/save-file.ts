// ** import third-party libraries
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { ExportMode } from '@/types/enums';

// Helper function to handle file saving logic
export const saveFile = async (
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
