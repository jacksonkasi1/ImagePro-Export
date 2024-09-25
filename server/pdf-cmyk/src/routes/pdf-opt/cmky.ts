import { Router } from "express";
import multer from "multer";
import { Request, Response } from "express";

// ** import utils
import { convertPdfToCmyk } from "../../utils/pdf-utils";
import { uploadPdfFile } from "../../utils/file-utils";
import { sendFileAndCleanup } from "../../utils/response-utils";

const router = Router();

// Configure Multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter: uploadPdfFile,
});


/**
 * POST /api/pdf-opt/cmyk-upload
 * Upload and convert PDF to CMYK
 */
router.post("/cmyk-upload", upload.single("file"), async (req: Request, res: Response) => {
    let outputFile: { outputPath: string; outputFilename: string } | undefined;
  
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }
  
      // Convert PDF to CMYK
      outputFile = await convertPdfToCmyk(req.file);

      // Send the converted PDF as a download and clean up both original and converted files
      await sendFileAndCleanup(res, outputFile.outputPath, outputFile.outputFilename, [
        req.file.path, // Original file
        outputFile.outputPath, // Converted file
      ]);
    } catch (error: any) {
      console.error("Server Error:", error);
  
      // Ensure cleanup even in the case of error
      const filesToCleanup = [req.file?.path, outputFile?.outputPath].filter(Boolean) as string[]; // Filter out undefined values
  
      await sendFileAndCleanup(res, "", "", filesToCleanup);
      res.status(500).json({ error: error.message || "Internal Server Error." });
    }
  },
);

export default router;