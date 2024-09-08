// ** import helpers
import { compressImage } from '@/helpers/file-operation';
import { processImageToCMYK } from '@/helpers/color-transform';
import { convertImageToPdf } from '@/helpers/pdf-operation/image-pdf';

// Convert image (as Blob) to CMYK and embed it into a PDF
export async function convertPdfToCYMK(imageBlob: Blob): Promise<Uint8Array> {
  // Process the image and convert it to CMYK
  const cmykImageBlob = await processImageToCMYK(imageBlob);

  // Convert the CMYK image to a PDF document
  const cmykPdfBytes = await convertImageToPdf(new Uint8Array(await cmykImageBlob.arrayBuffer()));

  return cmykPdfBytes;
}

// Convert image (as Blob) to Grayscale and embed it into a PDF
export async function convertPdfToGrayscale(imageBlob: Blob): Promise<Uint8Array> {
  try {
    // Process the image and convert it to CMYK
    let grayscaleImageBlob = await compressImage(imageBlob, 'png', 100, true);

    // Convert the grayscale image to a PDF document
    const grayscalePdfBytes = await convertImageToPdf(new Uint8Array(await grayscaleImageBlob.arrayBuffer()));

    return grayscalePdfBytes;
  } catch (error) {
    console.error('Error during grayscale conversion:', error);
    throw new Error('Grayscale conversion failed');
  }
}
