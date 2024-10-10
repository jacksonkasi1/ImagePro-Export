/**
 * Get the file extension based on content type
 * @param contentType MIME type of the file
 * @returns The file extension as a string
 */
export function getExtensionFromContentType(contentType: string): string {
  const mimeTypes: { [key: string]: string } = {
    'application/json': 'json',
    'application/xml': 'xml',
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'application/javascript': 'js',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'video/mp4': 'mp4',
    'application/pdf': 'pdf',
    'application/octet-stream': 'bin',
  };
  return mimeTypes[contentType] || 'bin';
}

/**
 * Checks if the given extension is valid and known.
 * @param extension The file extension to check.
 * @returns True if the extension is valid, false otherwise.
 */
export function isValidExtension(extension: string): boolean {
  const validExtensions = [
    'json',
    'xml',
    'txt',
    'html',
    'css',
    'js',
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
    'svg',
    'mp3',
    'ogg',
    'mp4',
    'pdf',
    'bin',
  ];
  return validExtensions.includes(extension.toLowerCase());
}
