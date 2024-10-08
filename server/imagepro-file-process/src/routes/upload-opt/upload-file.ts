import { Router, Request, Response } from "express";

// ** import third-party lib
import multer from "multer";

// ** import utils
import { uploadFileToPinata } from "../../utils/pinata-utils";
import { sendJsonResponseAndCleanup } from "../../utils/response-utils";
import { applyPassword, convertToColorMode } from "../../utils/pdf-utils";
import { sanitizeFileName, removeFile, uploadAllowedFile } from "../../utils/file-utils";

// ** import types
import { UploadedPdf } from "../../types/pdf";

const router = Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20 MB
  fileFilter: uploadAllowedFile, // Only allow certain file types (PDF, images)
});

/**
 * @route POST /upload-opt/files-upload
 * @desc Upload a file to Pinata Storage and return the file CID in JSON response
 * @param req Express request object
 * @param res Express response object
 */
router.post(
  "/files-upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      let { password, colorMode } = req.body;

      // Convert colorMode to lowercase
      colorMode = colorMode ? colorMode.toLowerCase() : null;

      // Check if a file was uploaded
      if (!file) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      const filePath = file.path; // Path to the uploaded file
      const fileName = sanitizeFileName(file.originalname); // Sanitize the file name

      let outputFile: UploadedPdf = { outputPath: file.path, outputFilename: fileName };

      // Convert color mode first if colorMode is provided
      if (colorMode === 'cmyk' || colorMode === 'grayscale') {
        outputFile = await convertToColorMode(outputFile, colorMode);
      }

      // Apply password protection if password is provided
      if (password) {
        outputFile = await applyPassword(outputFile, password);
      }

      // Upload the file to Pinata
      const response = await uploadFileToPinata(outputFile.outputPath, outputFile.outputFilename);

      // Return the CID in JSON response and clean up local files
      await sendJsonResponseAndCleanup(res, { cid: response.cid }, [outputFile.outputPath, filePath]);
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
