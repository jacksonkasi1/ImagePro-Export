import { Router } from "express";
import multer from "multer";
import { Request, Response } from "express";

import { applyPassword } from "../../utils/pdf-utils";
import { uploadPdfFile } from "../../utils/file-utils";
import { sendFileAndCleanup } from "../../utils/response-utils";

const router = Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: uploadPdfFile,
});

/**
 * POST /api/pdf-opt/password-upload
 * Upload and password-protect PDF
 */
router.post("/password-upload", upload.single("file"), async (req: Request, res: Response) => {
  let outputFile: { outputPath: string; outputFilename: string } | undefined;

  try {
    // Check if a file has been uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const password = req.body.password;

    // Check if a password is provided
    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    const file = { outputPath: req.file.path, outputFilename: req.file.originalname }

    // Apply password protection to the PDF
    outputFile = await applyPassword(file, password);

    // Send the password-protected PDF to the client and clean up temp files
    await sendFileAndCleanup(res, outputFile.outputPath, outputFile.outputFilename, [
      req.file.path,
      outputFile.outputPath,
    ]);
  } catch (error: any) {
    console.error("Server Error:", error);

    const filesToCleanup = [req.file?.path, outputFile?.outputPath].filter(Boolean) as string[];

    // Cleanup files if an error occurs
    await sendFileAndCleanup(res, "", "", filesToCleanup);
    res.status(500).json({ error: error.message || "Internal Server Error." });
  }
});

export default router;
