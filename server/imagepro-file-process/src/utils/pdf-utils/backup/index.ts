export * from "./backup/pdf-cmyk";
export * from "./backup/pdf-grayscale";
export * from "./backup/pdf-password";
export * from "./backup/pdf-merge";

// utils/pdf-utils.ts
import path from "path";
import { exec } from "child_process";
import { promises as fs } from "fs";

import { sanitizeFileName } from "../../utils/file-utils";
import { UploadedPdf } from "../../types/pdf";

const convertPdf = async (
  filePath: string,
  outputPath: string,
  conversionStrategy: string,
  processColorModel: string
): Promise<void> => {
  const gsCommand = `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sColorConversionStrategy=${conversionStrategy} -dProcessColorModel=${processColorModel} -sOutputFile="${outputPath}" "${filePath}"`;
  
  return new Promise((resolve, reject) => {
    exec(gsCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ghostscript Error: ${stderr}`);
        return reject(new Error("Error converting PDF."));
      }
      console.log(`Ghostscript Output: ${stdout}`);
      resolve();
    });
  });
};

const applyEncryption = async (
  filePath: string,
  outputPath: string,
  password: string
): Promise<void> => {
  const gsCommand = `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOwnerPassword=owner_pw -sUserPassword=${password} -dEncryptionR=3 -dKeyLength=128 -sOutputFile="${outputPath}" "${filePath}"`;
  
  return new Promise((resolve, reject) => {
    exec(gsCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ghostscript Error: ${stderr}`);
        return reject(new Error("Error applying password protection to PDF."));
      }
      console.log(`Ghostscript Output: ${stdout}`);
      resolve();
    });
  });
};

export const convertToColorMode = async (
  file: Express.Multer.File,
  mode: "cmyk" | "grayscale"
): Promise<UploadedPdf> => {
  const inputPath = path.resolve(file.path);
  const originalName = path.parse(file.originalname).name;
  const sanitizedOriginalName = sanitizeFileName(originalName);
  const outputFilename = `${sanitizedOriginalName}_${mode}.pdf`;
  const outputDir = path.resolve("public/assets");
  const outputPath = path.join(outputDir, outputFilename);

  await fs.mkdir(outputDir, { recursive: true });

  const conversion = mode === "cmyk" 
    ? { strategy: "CMYK", model: "/DeviceCMYK" }
    : { strategy: "Gray", model: "/DeviceGray" };

  await convertPdf(inputPath, outputPath, conversion.strategy, conversion.model);

  return { outputPath, outputFilename };
};

export const mergePdfFiles = async (files: Express.Multer.File[]): Promise<UploadedPdf> => {
  const outputDir = path.resolve("public/assets");
  const outputFilename = `merged_${Date.now()}.pdf`;
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
      console.log(`PDFtk Output: ${stdout}`);
      resolve({ outputPath, outputFilename });
    });
  });
};

export const applyConversion = async (file: UploadedPdf, mode: "cmyk" | "grayscale"): Promise<UploadedPdf> => {
  const outputDir = path.resolve("public/assets");
  const outputFilename = `${sanitizeFileName(path.parse(file.outputFilename).name)}_${mode}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  await fs.mkdir(outputDir, { recursive: true });

  const conversion = mode === "cmyk" 
    ? { strategy: "CMYK", model: "/DeviceCMYK" }
    : { strategy: "Gray", model: "/DeviceGray" };

  await convertPdf(file.outputPath, outputPath, conversion.strategy, conversion.model);

  return { outputPath, outputFilename };
};

export const applyPassword = async (file: UploadedPdf, password: string): Promise<UploadedPdf> => {
  const outputDir = path.resolve("public/assets");
  const outputFilename = `${sanitizeFileName(path.parse(file.outputFilename).name)}_protected.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  await fs.mkdir(outputDir, { recursive: true });

  await applyEncryption(file.outputPath, outputPath, password);

  return { outputPath, outputFilename };
};
