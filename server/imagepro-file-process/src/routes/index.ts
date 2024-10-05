import { Router } from "express";

// ** import pdf routes **
import cmkyRouter from "./pdf-opt/cmky";
import passwordRouter from "./pdf-opt/password";
import grayscaleRouter from "./pdf-opt/grayscale";
import mergeRouter from "./pdf-opt/merge";
import pdfProcessRouter from "./pdf-opt/process";

// ** import files upload routes **
import uploadRouter from "./upload-opt/upload";

const router = Router();

// PDF routes
router.use("/pdf-opt", cmkyRouter);
router.use("/pdf-opt", passwordRouter);
router.use("/pdf-opt", grayscaleRouter);
router.use("/pdf-opt", mergeRouter);
router.use("/pdf-opt", pdfProcessRouter);

// Files upload routes
router.use("/upload-opt", uploadRouter);

export default router;
