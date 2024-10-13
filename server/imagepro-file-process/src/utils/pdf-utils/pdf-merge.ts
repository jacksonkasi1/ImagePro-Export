import { PDFDocument } from 'pdf-lib';
import path from "path";
import { promises as fs } from "fs";

// ** import third-party lib
import { v4 as uuidv4 } from 'uuid';

// ** import types
import { UploadedPdf } from "../../types/pdf";

/**
 * Merges multiple PDF files into a single PDF using pdf-lib.
 * @param {Express.Multer.File[]} files - The uploaded PDF files.
 * @returns {Promise<UploadedPdf>} - The merged PDF file details.
 */
export const mergePdfFiles = async (files: Express.Multer.File[]): Promise<UploadedPdf> => {
  const outputDir = path.resolve("public/assets");
  const uniqueId = uuidv4();
  const outputFilename = `merged_${uniqueId}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  await fs.mkdir(outputDir, { recursive: true });

  try {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const fileBuffer = await fs.readFile(file.path);
      const pdfToMerge = await PDFDocument.load(fileBuffer);

      // Copy all pages from the PDF into the new document
      const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // Save the merged PDF to the file system
    const mergedPdfBytes = await mergedPdf.save();
    await fs.writeFile(outputPath, mergedPdfBytes);

    return { outputPath, outputFilename };
  } catch (error) {
    console.error("Error merging PDF files:", error);
    throw new Error("Error merging PDF files.");
  }
};
