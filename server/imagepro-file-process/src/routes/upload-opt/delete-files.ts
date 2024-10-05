import { Router, Request, Response } from "express";

// ** import utils
import { deleteFilesFromPinata } from "../../utils/pinata-utils";

const router = Router();

/**
 * @route POST /upload-opt/delete-files
 * @desc Delete multiple files from Pinata using CIDs
 * @body { cids: string[] }
 */
router.post(
  "/delete-files",
  async (req: Request, res: Response) => {
    try {
      const { cids } = req.body;

      // Validate cids
      if (!cids || !Array.isArray(cids)) {
        return res.status(400).json({ error: "CIDs must be an array." });
      }
      if (cids.length === 0 || cids.length > 1000) {
        return res.status(400).json({ error: "You can delete between 1 and 1000 CIDs." });
      }

      // Delete files from Pinata
      await deleteFilesFromPinata(cids);

      // Respond with success and deleted CIDs
      res.json({ success: true, deletedCids: cids });
    } catch (error: any) {
      console.error("Server Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error." });
    }
  }
);

export default router;
