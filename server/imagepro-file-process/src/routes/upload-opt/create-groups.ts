import { Router, Request, Response } from "express";

// ** import utils
import { createBulkGroups } from "../../utils/pinata-utils";

const router = Router();

/**
 * @route POST /upload-opt/create-groups
 * @desc Create multiple groups in Pinata
 * @body { groups: [{ name: string, isPublic: boolean }] }
 * @returns Array of created groups
 */
router.post(
  "/create-groups",
  async (req: Request, res: Response) => {
    try {
      const { groups } = req.body;

      // Validate groups
      if (!groups || !Array.isArray(groups) || groups.length === 0) {
        return res.status(400).json({ error: "Groups must be an array and cannot be empty." });
      }

      // Create bulk groups
      const createdGroups = await createBulkGroups(groups);

      // Return the created groups in the response
      res.json({ success: true, createdGroups });
    } catch (error: any) {
      console.error("Server Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error." });
    }
  }
);

export default router;
