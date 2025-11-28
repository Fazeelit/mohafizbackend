// routes/reportRoutes.js
import express from "express";
import {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
} from "../controllers/reportController.js";
import uploadImage from "../utill/uploadimage.js";
import verifyToken, { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// @desc    Create a new report
router.post("/createReport",verifyToken,uploadImage("files"), createReport);

// @desc    Get all reports
router.get("/",verifyToken, getReports);

// @desc    Get a single report by ID
router.get("/:id",verifyToken,verifyAdmin, getReportById);
// @desc    Get a single report by ID
router.put("/updateReport/:id",verifyToken,verifyAdmin, updateReport);

// @desc    Delete a report by ID
router.delete("/deleteReport/:id",verifyToken,verifyAdmin, deleteReport);

export default router;
