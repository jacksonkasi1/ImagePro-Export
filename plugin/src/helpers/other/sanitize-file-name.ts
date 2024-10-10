// ** import helpers
import { isValidExtension } from '@/helpers/other';

/**
 * Sanitizes a filename by removing or replacing invalid characters and ensuring proper extension.
 *
 * @param {string} filename - The original filename to sanitize.
 * @param {string} extension - The file extension to ensure.
 * @returns {string} - The sanitized filename.
 */
export function sanitizeFileName(filename: string, extension: string): string {
  // Trim leading and trailing spaces
  filename = filename.trim();

  // Remove any path information (just in case)
  filename = filename.replace(/^.*[\\/]/, '');

  // Remove any invalid characters and replace spaces with underscores
  filename = filename
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\w\-.]+/g, ''); // Remove invalid characters except letters, numbers, underscores, hyphens, and dots

  // Split the filename into base and extension using the last dot
  const lastDotIndex = filename.lastIndexOf('.');
  let baseName = filename;
  let fileExtension = '';

  if (lastDotIndex !== -1) {
    baseName = filename.substring(0, lastDotIndex);
    fileExtension = filename.substring(lastDotIndex + 1);
  }

  // Replace multiple dots in baseName with underscores
  baseName = baseName.replace(/\.+/g, '_');

  // If the extension is not in the known list, use the extension from content type
  if (!isValidExtension(fileExtension)) {
    fileExtension = extension;
  }

  // Ensure the extension is not empty
  if (fileExtension) {
    return `${baseName}.${fileExtension}`;
  } else {
    return baseName;
  }
}
