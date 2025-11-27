// routes/reportRoutes.js
import express from "express";
import {
  createReport,
  getReports,
  getReportById,
  deleteReport,
} from "../controllers/reportController.js";
import uploadImage from "../utill/uploadimage.js";

const router = express.Router();

// @desc    Create a new report
router.post("/createReport",uploadImage("files"), createReport);

// @desc    Get all reports
router.get("/", getReports);

// @desc    Get a single report by ID
router.get("/:id", getReportById);

// @desc    Delete a report by ID
router.delete("/deleteReport/:id", deleteReport);

export default router;
