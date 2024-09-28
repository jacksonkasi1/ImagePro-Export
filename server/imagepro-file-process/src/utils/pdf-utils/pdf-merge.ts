import path from "path";
import { promises as fs } from "fs";
import { exec } from "child_process";

import { v4 as uuidv4 } from 'uuid';

import { UploadedPdf } from "../../types/pdf";

/**
 * Merges multiple PDF files into a single PDF.
 * @param {Express.Multer.File[]} files - The uploaded PDF files.
 * @returns {Promise<UploadedPdf>} - The merged PDF file details.
 */
export const mergePdfFiles = async (files: Express.Multer.File[]): Promise<UploadedPdf> => {
  const outputDir = path.resolve("public/assets");
  const uniqueId = uuidv4();
  const outputFilename = `merged_${uniqueId}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  await fs.mkdir(outputDir, { recursive: true });

  const inputFiles = files.map(file => `"${file.path}"`).join(" ");
  const pdftkCommand = `pdftk ${inputFiles} cat output "${outputPath}"`;

  return new Promise((resolve, reject) => {
    exec(pdftkCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`PDFtk Error: ${stderr}`);
        return reject(new Error("Error merging PDF files."));
      }
      resolve({ outputPath, outputFilename });
    });
  });
};
