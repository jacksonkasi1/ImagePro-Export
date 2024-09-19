import express, { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { Express } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Configure Multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed.'));
    }
    cb(null, true);
  },
});

// POST /upload endpoint
app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const inputPath = path.resolve(req.file.path);
    const originalName = path.parse(req.file.originalname).name;
    const sanitizedOriginalName = originalName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
    const outputFilename = `${sanitizedOriginalName}_cmyk.pdf`;
    const outputDir = path.resolve('public/assets');
    const outputPath = path.join(outputDir, outputFilename);

    // Ensure the output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Ghostscript command to convert RGB PDF to CMYK
    const gsCommand = `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite ` +
                     `-sColorConversionStrategy=CMYK ` +
                     `-dProcessColorModel=/DeviceCMYK ` +
                     `-sOutputFile="${outputPath}" "${inputPath}"`;

    exec(gsCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Ghostscript Error: ${stderr}`);
        return res.status(500).json({ error: 'Error converting PDF.' });
      }

      console.log(`Ghostscript Output: ${stdout}`);

      try {
        // Delete the original uploaded file
        await fs.unlink(inputPath);
      } catch (unlinkError) {
        console.error('Error deleting the uploaded file:', unlinkError);
      }

      // Send the converted PDF as a download
      res.download(outputPath, outputFilename, async (err) => {
        if (err) {
          console.error('Error sending file:', err);
          return res.status(500).json({ error: 'Error sending the converted PDF.' });
        }

        try {
          // Optionally, delete the converted file after download
          await fs.unlink(outputPath);
        } catch (unlinkError) {
          console.error('Error deleting the converted file:', unlinkError);
        }
      });

      return;
    });

    return;
  } catch (error: any) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error.' });
  }
});

// GET /test route to serve public/index.html
app.get('/test', (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, '../public/index.html');
  res.sendFile(filePath);
});

// Basic health check endpoint
app.get('/', (_req: Request, res: Response) => {
  res.send('PDF RGB to CMYK Converter Server is running.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
