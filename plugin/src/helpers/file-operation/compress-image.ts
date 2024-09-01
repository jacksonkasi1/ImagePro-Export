import Compressor from 'compressorjs';

// import sub-helpers
import { getMimeType } from './mime-type';

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