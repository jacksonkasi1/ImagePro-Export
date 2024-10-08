/**
 * Utility function to get the MIME type based on the file format.
 * @param formatOption The file format option (JPG, PNG, WEBP, PDF, SVG).
 * @returns The corresponding MIME type.
 */
export const getMimeType = (format?: string): string => {
  switch (format?.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/png'; // generic binary data
  }
};
