import { saveAs } from 'file-saver';

// ** import lib
import notify from '@/lib/notify';

// ** import config
import { config } from '@/config';

/**
 * Utility function to download a file using CID with optional loading state support.
 *
 * @param {string} cid - The content identifier (CID) of the file.
 * @param {string} [fileName] - Optional. The name for the downloaded file. Defaults to the file name from the URL if not provided.
 * @param {(isLoading: boolean) => void} [setLoading] - Optional. A function to set the loading state.
 */
export async function downloadFile(
  cid: string,
  fileName?: string,
  setLoading?: (isLoading: boolean) => void
): Promise<void> {
  try {
    // Set loading state to true if setLoading is provided
    if (setLoading) setLoading(true);

    // Construct the file download URL using the CID
    const fileUrl = `${config.FILE_SERVER}/api/upload-opt/download-file?cid=${cid}`;

    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to download the file.`);
    }

    const blob = await response.blob();

    // If no fileName is provided, extract it from the CID
    const defaultFileName = fileName || `downloaded-file-${cid}`;

    // Use the provided file name or fallback to the default
    saveAs(blob, defaultFileName);

    notify.success(`File downloaded: ${defaultFileName}`);
  } catch (error: any) {
    notify.error(`Error downloading file: ${error?.message}`);
  } finally {
    // Set loading state to false when finished
    if (setLoading) setLoading(false);
  }
}
