import express, { Request, Response } from 'express';
import multer from 'multer';
import { promises as fs } from 'fs';

// ** import utils
import { convertToColorMode, applyPassword } from '../../utils/pdf-utils';

// ** import types
import { UploadedPdf } from '../../types/pdf';
import { sendFileAndCleanup } from '@/utils/response-utils';

const router = express.Router();

// Set up multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// POST /api/pdf-opt/process
router.post('/process', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;
  let { password, colorMode } = req.body;

  // Convert colorMode to lowercase
  colorMode = colorMode ? colorMode.toLowerCase() : null;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  if (!password && !colorMode) {
    return res.status(400).json({ error: 'Either password or color mode must be provided.' });
  }

  let outputFile: UploadedPdf = { outputPath: file.path, outputFilename: file.originalname };

  try {
    // Apply password protection if password is provided
    if (password) {
      outputFile = await applyPassword(outputFile, password);
    }

    // Convert color mode if colorMode is provided
    if (colorMode === 'cmyk' || colorMode === 'grayscale') {
      outputFile = await convertToColorMode(outputFile, colorMode);
    }

    // Send the password-protected PDF to the client and clean up temp files
    await sendFileAndCleanup(res, outputFile.outputPath, outputFile.outputFilename, [
      file.path,
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
