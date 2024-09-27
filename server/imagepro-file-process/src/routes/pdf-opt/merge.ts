import { Router } from "express";
import multer from "multer";
import { Request, Response } from "express";

import { mergePdfFiles, applyConversion, applyPassword } from "../../utils/pdf-utils";
import { uploadMultiplePdfFiles } from "../../utils/file-utils";
import { sendFileAndCleanup } from "../../utils/response-utils";

const router = Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024, files: 10 }, // 20 MB per file limit and max 10 files
  fileFilter: uploadMultiplePdfFiles,
});

/**
 * POST /api/pdf-opt/merge-upload
 * Upload multiple PDFs, optionally apply password protection and grayscale/CMYK conversion, then merge them into one.
 */
router.post("/merge-upload", (req: Request, res: Response) => {
  upload.array("files", 10)(req, res, async (err) => {
    let outputFile: { outputPath: string; outputFilename: string } | undefined;

    if (err instanceof multer.MulterError) {
      // Handle Multer-specific errors
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ error: "Cannot upload more than 10 PDF files." });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Handle other errors
      return res.status(500).json({ error: "An unexpected error occurred during file upload." });
    }

    try {
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length < 2) {
        return res.status(400).json({ error: "Please upload at least two PDF files." });
      }

      // Merge PDFs
      outputFile = await mergePdfFiles(files);

      // Optionally apply grayscale or CMYK conversion
      const colorMode = req.body.colorMode; // 'grayscale' or 'cmyk'
      if (colorMode) {
        outputFile = await applyConversion(outputFile, colorMode);
      }

      // Optionally apply password protection
      const password = req.body.password;
      if (password) {
        outputFile = await applyPassword(outputFile, password);
      }

      // Send the merged PDF as a download and clean up both original and merged files
      const filePathsToRemove = files.map((file: Express.Multer.File) => file.path).concat([outputFile.outputPath]);
      await sendFileAndCleanup(res, outputFile.outputPath, outputFile.outputFilename, filePathsToRemove);
    } catch (error: any) {
      console.error("Server Error:", error);

      const filePathsToCleanup = req.files ? (req.files as Express.Multer.File[]).map((file: Express.Multer.File) => file.path).filter(Boolean) : [];

      await sendFileAndCleanup(res, "", "", filePathsToCleanup);
      res.status(500).json({ error: error.message || "Internal Server Error." });
    }
  });
});

export default router;
