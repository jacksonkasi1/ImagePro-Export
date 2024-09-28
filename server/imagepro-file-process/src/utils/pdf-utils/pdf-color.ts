import path from "path";
import { promises as fs } from "fs";

import { v4 as uuidv4 } from 'uuid'; 

import { convertPdf } from "./pdf-convert";
import { sanitizeFileName } from "../../utils/file-utils";
import { UploadedPdf } from "../../types/pdf";

/**
 * Converts a PDF to a specific color mode (CMYK or Grayscale).
 * Supports both Express.Multer.File and UploadedPdf types.
 * @param {Express.Multer.File | UploadedPdf} file - The uploaded file or the PDF file details.
 * @param {"cmyk" | "grayscale"} mode - The color mode to convert to.
 * @returns {Promise<UploadedPdf>} - The converted PDF file details.
 */
export const convertToColorMode = async (
  file: Express.Multer.File | UploadedPdf,
  mode: "cmyk" | "grayscale"
): Promise<UploadedPdf> => {
  const inputPath = 'path' in file ? path.resolve(file.path) : path.resolve(file.outputPath);
  const originalName = 'originalname' in file ? file.originalname : file.outputFilename;
  const sanitizedOriginalName = sanitizeFileName(path.parse(originalName).name);

  // Generate a unique identifier
  const uniqueId = uuidv4();

  const outputFilename = `${sanitizedOriginalName}_${mode}_${uniqueId}.pdf`;
  const outputDir = path.resolve("public/assets");
  const outputPath = path.join(outputDir, outputFilename);

  await fs.mkdir(outputDir, { recursive: true });

  // Set the conversion strategy based on the mode
  const conversion = mode === "cmyk" 
    ? { strategy: "CMYK", model: "/DeviceCMYK" }
    : { strategy: "Gray", model: "/DeviceGray" };

  await convertPdf(inputPath, outputPath, conversion.strategy, conversion.model);

  return { outputPath, outputFilename };
};
