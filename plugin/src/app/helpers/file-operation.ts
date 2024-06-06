import Compressor from 'compressorjs/dist/compressor';

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

export const renameFile = (name: string, scale: number, format: string, caseOption: string, count: number): string => {
  const extension = format.toLowerCase();
  let fileName = `${name}__${count}__${scale}x.${extension}`;

  switch (caseOption) {
    case 'CAMEL_CASE':
      fileName = fileName.replace(/_/g, '');
      break;
    case 'SNAKE_CASE':
      fileName = fileName.replace(/-/g, '_');
      break;
    case 'KEBAB_CASE':
      fileName = fileName.replace(/_/g, '-');
      break;
    case 'PASCAL_CASE':
      fileName = fileName.replace(/_/g, '');
      fileName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      break;
  }

  return fileName;
};

export const compressImage = (file: Blob, format: string, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality,
      mimeType: getMimeType(format),
      success(result) {
        resolve(result);
      },
      error(err) {
        reject(err);
      },
    });
  });
};
