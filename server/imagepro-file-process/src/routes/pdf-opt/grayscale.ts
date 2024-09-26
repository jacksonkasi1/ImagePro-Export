import { Router } from "express";
import multer from "multer";
import { Request, Response } from "express";

import { convertPdfToGrayscale } from "../../utils/pdf-utils";
import { uploadPdfFile } from "../../utils/file-utils";
import { sendFileAndCleanup } from "../../utils/response-utils";

const router = Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: uploadPdfFile,
});

/**
 * POST /api/pdf-opt/grayscale-upload
 * Upload and convert PDF to Grayscale
 */
router.post("/grayscale-upload", upload.single("file"), async (req: Request, res: Response) => {
  let outputFile: { outputPath: string; outputFilename: string } | undefined;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Convert PDF to Grayscale
    outputFile = await convertPdfToGrayscale(req.file);

    // Send the converted PDF as a download and clean up both original and converted files
    await sendFileAndCleanup(res, outputFile.outputPath, outputFile.outputFilename, [
      req.file.path,
      outputFile.outputPath,
    ]);
  } catch (error: any) {
    console.error("Server Error:", error);

    // Ensure cleanup even in the case of error
    const filesToCleanup = [req.file?.path, outputFile?.outputPath].filter(Boolean) as string[];

    await sendFileAndCleanup(res, "", "", filesToCleanup);
    res.status(500).json({ error: error.message || "Internal Server Error." });
  }
});

export default router;
