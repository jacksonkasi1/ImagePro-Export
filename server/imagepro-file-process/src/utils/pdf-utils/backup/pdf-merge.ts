import path from "path";
import { exec } from "child_process";
import { promises as fs } from "fs";

import { sanitizeFileName } from "../../file-utils";
import { UploadedPdf } from "../../../types/pdf";

/**
 * Merge multiple PDFs into one using PDFtk
 * @param files - Array of uploaded PDF files
 * @returns Path to the merged PDF
 */
export const mergePdfFiles = async (files: Express.Multer.File[]): Promise<UploadedPdf> => {
  const outputDir = path.resolve("public/assets");
  const outputFilename = `merged_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  await fs.mkdir(outputDir, { recursive: true });

  const inputFiles = files.map(file => file.path).join(" ");
  const pdftkCommand = `pdftk ${inputFiles} cat output ${outputPath}`;

  return new Promise((resolve, reject) => {
    exec(pdftkCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`PDFtk Error: ${stderr}`);
        return reject(new Error("Error merging PDF files."));
      }

      console.log(`PDFtk Output: ${stdout}`);
      resolve({ outputPath, outputFilename });
    });
  });
};

/**
 * Apply grayscale or CMYK conversion to a PDF
 * @param file - Merged PDF file
 * @param mode - 'grayscale' or 'cmyk'
 * @returns Path to the converted PDF
 */
export const applyConversion = async (file: UploadedPdf, mode: string): Promise<UploadedPdf> => {
  const outputDir = path.resolve("public/assets");
  const outputFilename = `${sanitizeFileName(file.outputFilename.split(".pdf")[0])}_${mode}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  const gsCommand = mode === 'grayscale'
    ? `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sColorConversionStrategy=Gray -dProcessColorModel=/DeviceGray -sOutputFile="${outputPath}" "${file.outputPath}"`
    : `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sColorConversionStrategy=CMYK -dProcessColorModel=/DeviceCMYK -sOutputFile="${outputPath}" "${file.outputPath}"`;

  return new Promise((resolve, reject) => {
    exec(gsCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Ghostscript Error: ${stderr}`);
        return reject(new Error("Error applying color conversion to PDF."));
      }

      console.log(`Ghostscript Output: ${stdout}`);
      resolve({ outputPath, outputFilename });
    });
  });
};

/**
 * Apply password protection to a PDF
 * @param file - Merged PDF file
 * @param password - Password to be applied
 * @returns Path to the password-protected PDF
 */
export const applyPassword = async (file: UploadedPdf, password: string): Promise<UploadedPdf> => {
  const outputDir = path.resolve("public/assets");
  const outputFilename = `${sanitizeFileName(file.outputFilename.split(".pdf")[0])}_protected.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  const gsCommand = `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOwnerPassword=owner_pw -sUserPassword=${password} -dEncryptionR=3 -dKeyLength=128 -sOutputFile="${outputPath}" "${file.outputPath}"`;

  return new Promise((resolve, reject) => {
    exec(gsCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Ghostscript Error: ${stderr}`);
        return reject(new Error("Error applying password protection to PDF."));
      }

      console.log(`Ghostscript Output: ${stdout}`);
      resolve({ outputPath, outputFilename });
    });
  });
};
