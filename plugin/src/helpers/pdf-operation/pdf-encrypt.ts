// ** import third-party lib
import { PDFDocument } from 'pdf-lib-plus-encrypt';

// ** import lib
import notify from '@/lib/notify';

// Encrypt PDF using pdf-lib-plus-encrypt
export async function encryptPdfWithLib(pdfBytes: Uint8Array, password: string): Promise<Uint8Array | null> {
  try {
    // Load the existing PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Apply password protection using pdf-lib-plus-encrypt
    await pdfDoc.encrypt({
      userPassword: password, // User password to open the PDF
    });

    // Save the encrypted PDF as Uint8Array
    const encryptedPdfBytes = await pdfDoc.save();

    return encryptedPdfBytes;
  } catch (error) {
    await notify.error('Error encrypting the PDF.');
    console.error('Encryption error:', error);
    return null;
  }
}
