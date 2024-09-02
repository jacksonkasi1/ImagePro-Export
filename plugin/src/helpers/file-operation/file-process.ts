// ** import third-party lib
// import { PDFDocument } from 'pdf-lib';

// ** import sub-helpers
import { compressImage } from './compress-image';

// ** import types
import { FormatOption, PdfFormatOption } from '@/types/enums';

// Helper function to process and compress image & cover pdf formate
export const processImage = async (
  imageData: number[],
  formatOption: FormatOption,
  quality: number,
  pdfFormatOption?: PdfFormatOption
): Promise<Blob> => {

    const blob = new Blob([new Uint8Array(imageData)], {
    type: `image/${formatOption.toLowerCase()}`,
  });

  if (['JPG', 'PNG', 'WEBP'].includes(formatOption) && quality < 100) {
    return await compressImage(blob, formatOption, quality);
  }
  //   if (formatOption === 'PDF' && PdfFormatOption) {
  //     const pdfDoc = await PDFDocument.load(new Uint8Array(imageData));
  //     // Implement pdfFormatOption handling (RGB, CYMK, Grayscale) using pdf-lib functions
  //     const pdfBytes = await pdfDoc.save();
  //     return new Blob([pdfBytes], { type: 'application/pdf' });
  //   }
  return blob;
};
