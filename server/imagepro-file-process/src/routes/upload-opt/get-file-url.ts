import { Router, Request, Response } from "express";

// ** import utils
import { generateSignedURL } from "../../utils/pinata-utils";

const router = Router();

/**
 * @route GET /file-url
 * @desc Get a signed URL for a file using CID
 * @query cid Content Identifier (CID) of the file
 * @returns Signed file URL valid for 3 days
 */
router.get(
  "/file-url",
  async (req: Request, res: Response) => {
    try {
      const { cid } = req.query;

      // Check if CID is provided
      if (!cid || typeof cid !== 'string') {
        return res.status(400).json({ error: "CID is required as a query parameter." });
      }

      // Generate a signed URL with 3 days expiration
      const signedURL = await generateSignedURL(cid, 3);

      // Return the signed URL in the response
      res.json({ signedURL });
    } catch (error: any) {
      console.error("Server Error:", error);

      // Return a 500 error response in case of failure
      res.status(500).json({ error: error.message || "Internal Server Error." });
    }
  }
);

export default router;
