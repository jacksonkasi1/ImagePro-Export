import { Router } from "express";

// ** import pdf routes **
import cmkyRouter from "./pdf-opt/cmky";
import passwordRouter from "./pdf-opt/password";
import grayscaleRouter from "./pdf-opt/grayscale";
import mergeRouter from "./pdf-opt/merge";
import pdfProcessRouter from "./pdf-opt/process";

// ** import files routes **
import uploadFileRouter from "./upload-opt/upload-file";
import deleteFilesRouter from "./upload-opt/delete-files";
import downloadFileRouter from "./upload-opt/download-file";
import getFileUrlRouter from "./upload-opt/get-file-url";
// import createGroupsRouter from "./upload-opt/create-groups";

const router = Router();

// PDF routes
router.use("/pdf-opt", cmkyRouter);
router.use("/pdf-opt", passwordRouter);
router.use("/pdf-opt", grayscaleRouter);
router.use("/pdf-opt", mergeRouter);
router.use("/pdf-opt", pdfProcessRouter);

// Files upload routes
router.use("/upload-opt", uploadFileRouter);
router.use("/upload-opt", deleteFilesRouter);
router.use("/upload-opt", downloadFileRouter);
router.use("/upload-opt", getFileUrlRouter);
// router.use("/upload-opt", createGroupsRouter);

export default router;
