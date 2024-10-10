import { Router, Request, Response } from "express";

// ** import utils
import { deleteFilesFromPinata } from "../../utils/pinata-utils";

const router = Router();

/**
 * @route POST /upload-opt/delete-files
 * @desc Delete multiple files from Pinata using File IDs
 * @body { ids: string[] }
 */
router.post(
  "/delete-files",
  async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;

      // Validate cids
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: "IDs must be an array." });
      }
      if (ids.length === 0 || ids.length > 1000) {
        return res.status(400).json({ error: "You can delete between 1 and 1000 IDs." });
      }

      // Delete files from Pinata
      await deleteFilesFromPinata(ids);

      // Respond with success and deleted CIDs
      res.json({ success: true, deletedCids: ids });
    } catch (error: any) {
      console.error("Server Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error." });
    }
  }
);

export default router;
