// ** import third-party libraries
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ** import types
import { FileData } from '@/types/utils';
import { ExportMode } from '@/types/enums';

/**
 * Utility function to save files, either as individual files or in a ZIP file
 * based on the provided export mode (ZIP or AUTO).
 *
 * @param {FileData[]} files - The list of files to be saved.
 * @param {ExportMode} exportMode - Determines whether to export as ZIP or AUTO.
 * @param {string} [zipName] - Optional name for the ZIP file, defaults to 'exported_files.zip'.
 */
export const saveFiles = async (files: FileData[], exportMode: ExportMode, zipName: string = 'exported_files.zip') => {
  // Keep track of unique filenames
  const uniqueFileNames = new Set<string>();

  const getUniqueFileName = (fileName: string): string => {
    let uniqueName = fileName;
    let counter = 1;
    while (uniqueFileNames.has(uniqueName)) {
      const [base, extension] = fileName.split(/\.(?=[^\.]+$)/); // Split filename into base and extension
      uniqueName = `${base}_${counter}.${extension || ''}`;
      counter++;
    }
    uniqueFileNames.add(uniqueName);
    return uniqueName;
  };

  // If there's only one file and mode is AUTO, download it as a single file
  if (exportMode === ExportMode.AUTO && files.length === 1) {
    const { fileName, fileBlob } = files[0];
    const uniqueName = getUniqueFileName(fileName);
    saveAs(fileBlob, uniqueName);
    return;
  }

  // Otherwise, create a ZIP file for multiple files or if exportMode is ZIP
  const zip = new JSZip();

  for (const { fileName, fileBlob, base64Data } of files) {
    const uniqueName = getUniqueFileName(fileName);

    if (base64Data) {
      // Add base64-encoded file to the ZIP file
      zip.file(uniqueName, base64Data.split(',')[1], { base64: true });
    } else {
      // Add raw file blob to the ZIP file
      zip.file(uniqueName, fileBlob);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipName);
};
