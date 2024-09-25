import express from "express";
import path from "path";

import pdfRoutes from "@/routes";

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

// Use routes
app.use("/api", pdfRoutes);

// Basic health check endpoint
app.get("/", (_req, res) => {
  res.send("PDF RGB to CMYK Converter Server is running.");
});

export default app;
