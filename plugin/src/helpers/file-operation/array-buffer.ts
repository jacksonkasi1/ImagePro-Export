// import sub-helpers
import { getMimeType } from './mime-type';

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
