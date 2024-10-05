import { Response } from "express";
import { promises as fs } from "fs";

/**
 * Sends the file as a download in the response and cleans up the files after sending.
 * @param res Express response object
 * @param filePath Path to the file to send
 * @param fileName Name of the file to be downloaded
 * @param filesToRemove List of file paths to be removed after sending the file
 */
export const sendFileAndCleanup = async (
  res: Response,
  filePath: string,
  fileName: string,
  filesToRemove: string[],
) => {
  res.download(filePath, fileName, async (err) => {
    if (err) {
      console.error("Error sending file:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error sending the file." });
      }
    }

    // Clean up all files in filesToRemove array
    await cleanUpFiles(filesToRemove);
  });
};


/**
 * Utility function to clean up multiple files
 * @param filePaths Array of file paths to remove
 */
export const cleanUpFiles = async (filePaths: string[]): Promise<void> => {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
      console.log(`Successfully deleted file: ${filePath}`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠️  File not found, skipping: ${filePath}`);
      } else {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    }
  }
};

/**
 * Sends JSON response with file link and cleans up specified files.
 * @param res Express Response object
 * @param fileLink URL of the uploaded file
 * @param filesToRemove Array of file paths to delete
 */
export const sendFileLinkAndCleanup = async (
  res: Response,
  fileLink: string,
  filesToRemove: string[]
) => {
  res.json({ link: fileLink });
  await cleanUpFiles(filesToRemove);
};