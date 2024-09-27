import path from "path";
import { exec } from "child_process";
import { promises as fs } from "fs";

// Import the utility function and types
import { sanitizeFileName } from "../file-utils";
import { UploadedPdf } from "../../types/pdf";

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
