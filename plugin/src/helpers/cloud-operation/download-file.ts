import { saveAs } from 'file-saver';

// ** import lib
import notify from '@/lib/notify';

// ** import config
import { config } from '@/config';

// ** import helpers
import { sanitizeFileName, getExtensionFromContentType  } from '@/helpers/other';

/**
 * Utility function to download a file using CID with optional loading state support.
 *
 * @param {string} cid - The content identifier (CID) of the file.
 * @param {string} [fileName] - Optional. The name for the downloaded file.
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

    // Get content type from response headers
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';

    // Get extension from content type
    const extension = getExtensionFromContentType(contentType);

    // Try to extract filename from Content-Disposition header
    let filename = fileName;
    const disposition = response.headers.get('Content-Disposition');
    if (disposition && disposition.includes('filename=')) {
      const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch != null && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // If no fileName is provided or extracted, use a default
    if (!filename) {
      filename = `downloaded-file-${cid}`;
    }

    // Sanitize the filename (remove or replace problematic characters)
    filename = sanitizeFileName(filename, extension);

    // Ensure the filename ends with the correct extension
    if (!filename.endsWith(`.${extension}`)) {
      filename = `${filename}.${extension}`;
    }

    // Use the sanitized filename with proper extension
    saveAs(blob, filename);

    notify.success(`File downloaded: ${filename}`);
  } catch (error: any) {
    notify.error(`Error downloading file: ${error?.message}`);
  } finally {
    // Set loading state to false when finished
    if (setLoading) setLoading(false);
  }
}
