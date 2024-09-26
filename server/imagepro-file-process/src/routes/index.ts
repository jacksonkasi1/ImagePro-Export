import { Router } from "express";

// ** import routes **
import cmkyRouter from "./pdf-opt/cmky";
import passwordRouter from "./pdf-opt/password";

const router = Router();

// PDF optimization routes
router.use("/pdf-opt", cmkyRouter);
router.use("/pdf-opt", passwordRouter);

export default router;
