import { saveAs } from 'file-saver';

// ** import lib
import notify from '@/lib/notify';

/**
 * Utility function to fetch and download a file with optional loading state support.
 *
 * @param {string} fileUrl - The URL of the file to download.
 * @param {string} [fileName] - Optional. The name for the downloaded file. Defaults to the file name from the URL if not provided.
 * @param {(isLoading: boolean) => void} [setLoading] - Optional. A function to set the loading state.
 */
export async function downloadFile(
  fileUrl: string,
  fileName?: string,
  setLoading?: (isLoading: boolean) => void
): Promise<void> {
  try {
    // Set loading state to true if setLoading is provided
    if (setLoading) setLoading(true);

    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to download the file.`);
    }

    const blob = await response.blob();

    // If no fileName is provided, extract it from the URL
    const defaultFileName = fileUrl.split('/').pop() || 'downloaded-file';

    // Use the provided file name or fallback to the default
    saveAs(blob, fileName || defaultFileName);

    notify.success(`File downloaded: ${fileName || defaultFileName}`);
  } catch (error: any) {
    notify.error(`Error downloading file: ${error?.message}`);
  } finally {
    // Set loading state to false when finished
    if (setLoading) setLoading(false);
  }
}
