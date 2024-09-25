import { Router } from "express";

// ** import routes **
import cmkyRouter from "./pdf-opt/cmky";

const router = Router();

// PDF optimization routes
router.use("/pdf-opt", cmkyRouter);

export default router;
