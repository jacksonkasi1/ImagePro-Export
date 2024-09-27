import { promises as fs } from "fs";
import { FileFilterCallback } from "multer";

/**
 * Upload filter to accept only PDF files
 * @param _req Request object
 * @param file File being uploaded
 * @param cb Callback function for filtering
 */
export const uploadPdfFile = (_req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed."));
  }
  cb(null, true);
};

/**
 * Remove file from the file system
 * @param filePath Path of the file to be deleted
 */
export const removeFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error deleting the file: ${filePath}`, error);
  }
};

/**
 * Sanitize file names to prevent security issues
 * @param originalName The original file name
 * @returns Sanitized file name
 */
export const sanitizeFileName = (originalName: string): string => {
    return originalName
      .replace(/\s+/g, "_")        // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9_\-]/g, "");  // Remove special characters
};

/**
 * Validate that only PDF files are uploaded (multiple file upload)
 */
export const uploadMultiplePdfFiles = (_req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed."));
  }
  cb(null, true);
};