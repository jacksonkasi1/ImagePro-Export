import { Router, Request, Response } from "express";

// ** import utils
import { downloadFileFromPinata } from "../../utils/pinata-utils";

const router = Router();

/**
 * @route GET /download-file
 * @desc Download a file from Pinata using CID
 * @query cid Content Identifier (CID) of the file
 */
router.get(
  "/download-file",
  async (req: Request, res: Response) => {
    try {
      const { cid } = req.query;

      // Validate CID
      if (!cid || typeof cid !== 'string') {
        return res.status(400).json({ error: "CID is required as a query parameter." });
      }

      // Download file from Pinata using the utility function
      const file = await downloadFileFromPinata(cid);

      // Set appropriate headers for file download
      res.setHeader("Content-Type", file.contentType || "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${cid}"`);

      // Send the file data
      res.send(file.data);
    } catch (error: any) {
      console.error("Server Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error." });
    }
  }
);

export default router;