// ** import 3rd-party
import { PDFDocument } from 'pdf-lib-plus-encrypt';

/**
 * Converts an image (PNG or JPG) into a PDF document.
 * @param imageBytes The Uint8Array of the image (PNG or JPG).
 * @param isJpg Optional boolean indicating if the image is a JPG (defaults to true for JPG).
 * @returns Uint8Array of the generated PDF document with the image embedded.
 */
export async function convertImageToPdf(imageBytes: Uint8Array, isJpg: boolean = false): Promise<Uint8Array> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Embed the image into the new PDF
    let embeddedImage;
    if (isJpg) {
      embeddedImage = await pdfDoc.embedJpg(imageBytes); // Embed JPG image
    } else {
      embeddedImage = await pdfDoc.embedPng(imageBytes); // Embed PNG image
    }

    // Add a new page with the image
    const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: embeddedImage.width,
      height: embeddedImage.height,
    });

    // Save and return the new PDF document as Uint8Array
    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  } catch (error) {
    console.error('Error during image-to-PDF conversion:', error);
    throw new Error('Image-to-PDF conversion failed');
  }
}
