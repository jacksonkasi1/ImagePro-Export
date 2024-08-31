import Compressor from 'compressorjs';

export const arrayBufferToBase64 = (buffer: Uint8Array, format?: string): Promise<string> => {
  const mimeType = getMimeType(format);
  const blob = new Blob([buffer], { type: mimeType });
  const reader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject('Error converting buffer to base64');
      }
    };
    reader.readAsDataURL(blob);
  });
};

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
      return 'application/octet-stream'; // generic binary data
  }
};

interface RenameFileParams {
  name: string;
  format: string;
  caseOption: string;
  count?: number; // Optional parameter
}

export const renameFile = ({ name, format, caseOption, count }: RenameFileParams): string => {
  let baseName = name.trim(); // Trim any leading or trailing spaces

  switch (caseOption) {
    case 'camelCase':
      // Remove spaces, and convert the following character to uppercase
      baseName = baseName
        .toLowerCase()
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
        .replace(/\s+/g, '');
      break;
    case 'snake_case':
      // Replace spaces or dashes with underscores
      baseName = baseName.toLowerCase().replace(/[\s-]+/g, '_');
      break;
    case 'kebab-case':
      // Replace spaces or underscores with dashes
      baseName = baseName.toLowerCase().replace(/[\s_]+/g, '-');
      break;
    case 'PascalCase':
      // Remove spaces and capitalize the first letter of each word
      baseName = baseName.replace(/(^\w|\s\w)/g, (letter) => letter.toUpperCase()).replace(/[\s_-]+/g, ''); // Remove spaces, underscores, and dashes
      break;
    default:
      break;
  }

  const extension = format.toLowerCase();
  return `${baseName}${count !== undefined ? `_${count}` : ''}.${extension}`;
};

export const compressImage = (file: Blob, format: string, quality: number): Promise<Blob> => {
  // Convert the quality from a percentage (e.g., 80) to a decimal (e.g., 0.8)
  const normalizedQuality = quality / 100;

  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: normalizedQuality, // Use the normalized quality value
      mimeType: getMimeType(format),
      success(result) {
        resolve(result);
      },
      error(err) {
        console.error('Compression error', err); // Debug log
        reject(err);
      },
    });
  });
};
