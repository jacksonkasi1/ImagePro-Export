// ** import helper
import { compressImage } from './compress-image';
import { encryptPdfWithLib } from '@/helpers/pdf-encrypt';

// ** import types
import { FormatOption, PdfFormatOption } from '@/types/enums';

// Interface for the processImage function parameters
interface ProcessImageParams {
  imageData: number[]; // Image data to be processed
  formatOption: FormatOption; // Format of the image (JPG, PNG, PDF, etc.)
  quality: number; // Image quality for compression
  pdfFormatOption?: PdfFormatOption; // Optional PDF format options
  password?: string; // Optional password for encrypting PDFs
}

// Helper function to process and compress image & cover pdf format
export const processImage = async ({
  imageData,
  formatOption,
  quality,
  pdfFormatOption,
  password,
}: ProcessImageParams): Promise<Blob> => {
  const blob = new Blob([new Uint8Array(imageData)], {
    type: `image/${formatOption.toLowerCase()}`,
  });

  // Handle image compression for JPG, PNG, and WEBP
  if (['JPG', 'PNG', 'WEBP'].includes(formatOption) && quality < 100) {
    return await compressImage(blob, formatOption, quality);
  }

  // Handle PDF encryption if the format is PDF and password is provided
  if (formatOption === 'PDF') {
    const pdfBytes = new Uint8Array(await blob.arrayBuffer());

    if (!password) {
      return blob; // Return original PDF if no password is provided
    }

    // Encrypt the PDF using pdf-lib-plus-encrypt
    const encryptedPdfData = await encryptPdfWithLib(pdfBytes, password);

    if (!encryptedPdfData) {
      return blob; // Return original PDF if encryption fails
    }

    return new Blob([encryptedPdfData], { type: 'application/pdf' });
  }

  return blob;
};
