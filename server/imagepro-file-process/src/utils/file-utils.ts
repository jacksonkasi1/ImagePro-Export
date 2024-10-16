import { promises as fs } from "fs";

// ** import third-party lib
import { FileFilterCallback } from "multer";

/**
 * Upload filter to accept only PDF files
 * @param _req Request object
 * @param file File being uploaded
 * @param cb Callback function for filtering
 */
export const uploadPdfFile = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  console.log(
    `File received for upload: ${file.originalname}, mimetype: ${file.mimetype}`,
  );

  if (file.mimetype !== "application/pdf") {
    console.error("Upload Error: Only PDF files are allowed.");
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
 * Remove multiple files from the file system
 * @param filePaths Array of file paths to be deleted
 */
export const removeFiles = async (filePaths: string[]): Promise<void> => {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
      console.log(`Successfully deleted file: ${filePath}`);
    } catch (error) {
      console.error(`Error deleting the file: ${filePath}`, error);
    }
  }
};

/**
 * Sanitize file names to prevent security issues
 * @param originalName The original file name
 * @returns Sanitized file name
 */
export const sanitizeFileName = (originalName: string): string => {
  return originalName
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_\-]/g, ""); // Remove special characters
};

/**
 * Validate that only PDF files are uploaded (multiple file upload)
 */
export const uploadMultiplePdfFiles = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed."));
  }
  cb(null, true);
};

/**
 * Filters uploaded files to allow only PDFs and specific image types
 * @param _req Express Request object
 * @param file Uploaded file
 * @param cb Callback to accept or reject the file
 */
export const uploadAllowedFile = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/webp",
    "image/svg+xml",
    "image/png",
    "image/jpeg",
    "image/avif",
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        "Only PDF and image files (webp, svg, png, jpg/jpeg, avif) are allowed.",
      ),
    );
  }
  cb(null, true);
};
