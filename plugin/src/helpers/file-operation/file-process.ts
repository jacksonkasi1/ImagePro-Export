// ** import helpers
import { compressImage } from '@/helpers/file-operation/compress-image';
import { config } from '@/config'; // Import base URL from config

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

/**
 * Helper function to process and compress image & cover PDF format.
 * Calls the server API to handle PDF color conversion and encryption.
 * If exporting PDF in RGB format without a password, the function will return the blob directly.
 * @param {ProcessFilesParams} params - The file processing parameters.
 * @returns {Promise<Blob>} - The processed file as a Blob.
 */
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

    // If exporting PDF in RGB format without password, return the blob directly
    if (pdfFormatOption === PdfFormatOption.RGB && !password) {
      return new Blob([new Uint8Array(await blob.arrayBuffer())], { type: 'application/pdf' });
    }

    const formData = new FormData();
    formData.append('file', blob);

    // Perform color conversion and password protection via server API
    let apiUrl = `${config.FILE_SERVER}/api/pdf-opt/process`;

    // Add the PDF color format option if it's not RGB
    if (pdfFormatOption !== PdfFormatOption.RGB) {
      formData.append('colorMode', pdfFormatOption); // CMYK or Grayscale
    }

    // Add the password if provided
    if (password) {
      formData.append('password', password);
    }

    // Call the server API to process the PDF
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('PDF processing failed:', response.statusText);
      throw new Error('PDF processing failed');
    }

    // Get the processed PDF blob from the server response
    const pdfBlob = await response.blob();
    return pdfBlob;
  }

  // Return the original blob if no further processing is required
  return blob;
};
