// ** import helper
import { compressImage } from '@/helpers/file-operation/compress-image';
import { encryptPdfWithLib } from '@/helpers/pdf-operation/pdf-encrypt';
import { convertPdfToCYMK, convertPdfToGrayscale } from '@/helpers/pdf-operation/pdf-utils';

// ** import types
import { FormatOption, PdfFormatOption } from '@/types/enums';

// Interface for the processImage function parameters
interface ProcessFilesParams {
  imageData: number[]; // Image data to be processed
  formatOption: FormatOption; // Format of the image (JPG, PNG, PDF, etc.)
  quality: number; // Image quality for compression
  pdfFormatOption?: PdfFormatOption; // Optional PDF format options
  password?: string; // Optional password for encrypting PDFs
}

// Helper function to process and compress image & cover pdf format
export const processFiles = async ({
  imageData,
  formatOption,
  quality,
  pdfFormatOption = PdfFormatOption.RGB, // Default to RGB
  password,
}: ProcessFilesParams): Promise<Blob> => {

  // Create a blob from the imageData
  const blob = new Blob([new Uint8Array(imageData)], {
    type: `image/png`,
  });

  // Handle image compression for JPG, PNG, and WEBP formats
  if (['JPG', 'PNG', 'WEBP'].includes(formatOption)) {
    if (quality < 100) {
      return await compressImage(blob, formatOption, quality); // Compress image if quality is less than 100
    }
    return blob; // Return the original blob if no compression is needed
  }

  // Handle PDF processing if the format is PDF
  if (formatOption === 'PDF') {
    let pdfBytes = new Uint8Array(await blob.arrayBuffer());

    // Perform color conversion based on the pdfFormatOption
    if (pdfFormatOption === PdfFormatOption.CYMK) {
      pdfBytes = await convertPdfToCYMK(blob); // Convert to CYMK
    } else if (pdfFormatOption === PdfFormatOption.Grayscale) {
      pdfBytes = await convertPdfToGrayscale(blob); // Convert to Grayscale
    }

    // If a password is provided, encrypt the PDF
    if (password) {
      const encryptedPdfData = await encryptPdfWithLib(pdfBytes, password);
      if (encryptedPdfData) {
        return new Blob([encryptedPdfData], { type: 'application/pdf' }); // Return encrypted PDF blob
      } else {
        console.warn('PDF encryption failed. Returning unencrypted PDF.');
        return blob; // Return original PDF if encryption fails
      }
    }

    // Return the processed PDF without encryption
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  // Return the original blob if no further processing is required
  return blob;
};
