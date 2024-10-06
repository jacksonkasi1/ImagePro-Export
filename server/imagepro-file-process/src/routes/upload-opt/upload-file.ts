import multer from "multer";
import { Router, Request, Response } from "express";

// ** import environment variables
import { env } from "../../config/env";

// ** import utils
import { uploadFileToPinata } from "../../utils/pinata-utils";
import { sendFileLinkAndCleanup } from "../../utils/response-utils";
import {
  sanitizeFileName,
  removeFile,
  uploadAllowedFile,
} from "../../utils/file-utils";

const router = Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20 MB
  fileFilter: uploadAllowedFile, // Only allow certain file types (PDF, images)
});

/**
 * @route POST /upload-opt/files-upload
 * @desc Upload a file to Pinata Storage and return the file link
 * @param req Express request object
 * @param res Express response object
 */
router.post(
  "/files-upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      const filePath = req.file.path; // Path to the uploaded file
      const fileName = sanitizeFileName(req.file.originalname); // Sanitize the file name

      // Upload the file to Pinata
      const response = await uploadFileToPinata(filePath, fileName);

      // Construct the file link from Pinata response
      const uploadedFileLink = `${env.PINATA_GATEWAY}/ipfs/${response.cid}`;

      // Send the file link in response and clean up local files
      await sendFileLinkAndCleanup(res, uploadedFileLink, [filePath]);
    } catch (error: any) {
      console.error("Server Error:", error);

      // Clean up uploaded file in case of error
      if (req.file?.path) {
        await removeFile(req.file.path);
      }

      // Return a 500 error response
      res.status(500).json({ error: error.message || "Internal Server Error." });
    }
  }
);

export default router;
