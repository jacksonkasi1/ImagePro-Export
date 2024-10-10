import path from "path";
import { promises as fs } from "fs";

// ** import third-party lib
import { v4 as uuidv4 } from 'uuid';

// ** import sub-utils
import { applyEncryption } from "./pdf-convert";

// ** import utils
import { sanitizeFileName } from "../../utils/file-utils";

// ** import types
import { UploadedPdf } from "../../types/pdf";

/**
 * Applies password protection to a PDF.
 * @param {UploadedPdf} file - The uploaded PDF file details.
 * @param {string} password - The password to apply.
 * @returns {Promise<UploadedPdf>} - The password-protected PDF file details.
 */
export const applyPassword = async (file: UploadedPdf, password: string): Promise<UploadedPdf> => {
  const outputDir = path.resolve("public/assets");
  const uniqueId = uuidv4();
  const outputFilename = `${sanitizeFileName(path.parse(file.outputFilename).name)}_protected_${uniqueId}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  await fs.mkdir(outputDir, { recursive: true });
  await applyEncryption(file.outputPath, outputPath, password);

  return { outputPath, outputFilename };
};
