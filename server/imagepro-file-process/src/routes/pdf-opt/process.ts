import express, { Request, Response } from 'express';
import multer from 'multer';
import { promises as fs } from 'fs';

// ** import utils
import { convertToColorMode, applyPassword } from '@/utils/pdf-utils';

// ** import types
import { UploadedPdf } from '@/types/pdf';

const router = express.Router();

// Set up multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// POST /api/pdf-opt/process
router.post('/process', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;
  const { password, colorMode } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  if (!password && !colorMode) {
    return res.status(400).json({ error: 'Either password or color mode must be provided.' });
  }

  let processedFile: UploadedPdf = { outputPath: file.path, outputFilename: file.originalname };

  try {
    // Apply password protection if password is provided
    if (password) {
      processedFile = await applyPassword(processedFile, password);
    }

    // Convert color mode if colorMode is provided
    if (colorMode === 'cmyk' || colorMode === 'grayscale') {
      processedFile = await convertToColorMode(processedFile, colorMode);
    }

    // Send the processed file to the user
    res.download(processedFile.outputPath, processedFile.outputFilename, async (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).json({ error: 'Error processing file.' });
      }

      // Clean up files after sending
      await fs.unlink(file.path);
      await fs.unlink(processedFile.outputPath);
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Error processing PDF.' });

    // Cleanup uploaded file if error occurs
    await fs.unlink(file.path);
  }
});

export default router;
