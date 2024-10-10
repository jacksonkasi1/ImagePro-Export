import { Router, Request, Response } from "express";

// ** import third-party lib
import multer from "multer";

// ** import utils
import { uploadFileToPinata, getOptimizedImageFromPinata } from "../../utils/pinata-utils";
import { sendJsonResponseAndCleanup } from "../../utils/response-utils";
import { applyPassword, convertToColorMode } from "../../utils/pdf-utils";
import { sanitizeFileName, removeFile, uploadAllowedFile } from "../../utils/file-utils";

// ** import config
import { env } from "../../config/env";

// ** import types
import { UploadedPdf } from "../../types/pdf";

const router = Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20 MB
  fileFilter: uploadAllowedFile, // Only allow certain file types (PDF, images)
});

const groupId = env.PINATA_PUBLIC_GROUP_ID; // Pinata public group id, to get file without signed URL


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
      let { password, colorMode, thumbnail } = req.body;

      // Convert colorMode to lowercase
      colorMode = colorMode ? colorMode.toLowerCase() : null;
      thumbnail = thumbnail === "true"; // Ensure thumbnail is treated as boolean

      // Check if a file was uploaded
      if (!file) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      const filePath = file.path; // Path to the uploaded file
      const fileName = sanitizeFileName(file.originalname); // Sanitize the file name
      const mimeType = file.mimetype

      let outputFile: UploadedPdf = {
        outputPath: file.path,
        outputFilename: fileName,
      };

      // Check if it's a PDF based on mimeType
      const isPdf = mimeType === "application/pdf";

      // Convert color mode first if colorMode is provided and it's a PDF
      if (isPdf && (colorMode === "cmyk" || colorMode === "grayscale")) {
        outputFile = await convertToColorMode(outputFile, colorMode);
      }

      // Apply password protection if password is provided and it's a PDF
      if (isPdf && password) {
        outputFile = await applyPassword(outputFile, password);
      }

      // Upload the file to Pinata, with groupId if provided
      const response = await uploadFileToPinata(
        outputFile.outputPath,
        outputFile.outputFilename,
        groupId,
      );

      let thumbnailCid: string | null = null;

      // If thumbnail is requested and the file is not a PDF, generate the thumbnail
      if (thumbnail && !isPdf) {
        const optimizedImage = await getOptimizedImageFromPinata(response.cid, {
          width: 60,
          height: 60,
          format: "webp",
        });

        const thumbnailFileName = `thumbnail_${fileName}`;

        const thumbnailUploadResponse = await uploadFileToPinata(
          optimizedImage.data,
          thumbnailFileName,
          groupId,
          optimizedImage.contentType || "image/png",
        );

        thumbnailCid = thumbnailUploadResponse.cid;
      }

      // Return the CID and thumbnail in JSON response, and clean up local files
      await sendJsonResponseAndCleanup(
        res,
        { cid: response.cid, thumbnail_cid: thumbnailCid },
        [outputFile.outputPath, filePath],
      );
    } catch (error: any) {
      console.error("Server Error:", error);

      if (req.file?.path) {
        await removeFile(req.file.path);
      }

      res
        .status(500)
        .json({ error: error.message || "Internal Server Error." });
    }
  },
);

export default router;
