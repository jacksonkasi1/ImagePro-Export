import path from "path";
import { exec } from "child_process";
import { promises as fs } from "fs";

// Import the utility function and types
import { sanitizeFileName } from "../utils/file-utils";
import { UploadedPdf } from "../types/pdf";

/**
 * Convert a PDF file to CMYK using Ghostscript
 * @param file The uploaded PDF file
 * @returns Path to the converted CMYK file
 */
export const convertPdfToCmyk = async (file: Express.Multer.File): Promise<UploadedPdf> => {
  const inputPath = path.resolve(file.path);
  const originalName = path.parse(file.originalname).name;

  const sanitizedOriginalName = sanitizeFileName(originalName); // Use the utility function
  const outputFilename = `${sanitizedOriginalName}_cmyk.pdf`;

  const outputDir = path.resolve("public/assets");
  const outputPath = path.join(outputDir, outputFilename);

  // Ensure the output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Ghostscript command to convert RGB PDF to CMYK
  const gsCommand = `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sColorConversionStrategy=CMYK -dProcessColorModel=/DeviceCMYK -sOutputFile="${outputPath}" "${inputPath}"`;

  return new Promise((resolve, reject) => {
    exec(gsCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Ghostscript Error: ${stderr}`);
        return reject(new Error("Error converting PDF to CMYK."));
      }

      console.log(`Ghostscript Output: ${stdout}`);
      resolve({ outputPath, outputFilename });
    });
  });
};

// Ghostscript command to set password on PDF
export const setPasswordOnPdf = async (file: Express.Multer.File, password: string): Promise<UploadedPdf> => {
  const inputPath = path.resolve(file.path);
  const originalName = path.parse(file.originalname).name;
  const sanitizedOriginalName = sanitizeFileName(originalName);
  const outputFilename = `${sanitizedOriginalName}_protected.pdf`;
  const outputDir = path.resolve("public/assets");
  const outputPath = path.join(outputDir, outputFilename);

  await fs.mkdir(outputDir, { recursive: true });

  const gsCommand = `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOwnerPassword=owner_pw -sUserPassword=${password} -dEncryptionR=3 -dKeyLength=128 -sOutputFile="${outputPath}" "${inputPath}"`;

  return new Promise((resolve, reject) => {
    exec(gsCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Ghostscript Error: ${stderr}`);
        return reject(new Error("Error setting password on PDF."));
      }

      console.log(`Ghostscript Output: ${stdout}`);
      resolve({ outputPath, outputFilename });
    });
  });
};

// Ghostscript command to convert PDF to Grayscale
export const convertPdfToGrayscale = async (file: Express.Multer.File): Promise<UploadedPdf> => {
  const inputPath = path.resolve(file.path);
  const originalName = path.parse(file.originalname).name;
  const sanitizedOriginalName = sanitizeFileName(originalName);
  const outputFilename = `${sanitizedOriginalName}_grayscale.pdf`;
  const outputDir = path.resolve("public/assets");
  const outputPath = path.join(outputDir, outputFilename);

  await fs.mkdir(outputDir, { recursive: true });

  const gsCommand = `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sColorConversionStrategy=Gray -dProcessColorModel=/DeviceGray -sOutputFile="${outputPath}" "${inputPath}"`;

  return new Promise((resolve, reject) => {
    exec(gsCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Ghostscript Error: ${stderr}`);
        return reject(new Error("Error converting PDF to Grayscale."));
      }

      console.log(`Ghostscript Output: ${stdout}`);
      resolve({ outputPath, outputFilename });
    });
  });
};