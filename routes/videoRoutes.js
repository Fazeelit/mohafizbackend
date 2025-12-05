import express from "express";
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  downloadVideo, // ✅ import download controller
} from "../controllers/videoController.js";

import verifyToken, { verifyAdmin } from "../middleware/auth.js";
import validateId from "../middleware/validateId.js";
import uploadVideofile from "../util/uploadVideo.js";

const router = express.Router();

/* ------------------------- PUBLIC ROUTES ------------------------- */

// Get all videos
router.get("/",verifyToken, getAllVideos);

// Get single video by ID
router.get("/:id", validateId,verifyToken, getVideoById);

// Download video by ID
router.get("/download/:id", validateId, downloadVideo); // ✅ new route

/* ------------------------ ADMIN ROUTES --------------------------- */

// Upload new video (Admin only)
router.post(
  "/uploadVideo",
  verifyToken,
  verifyAdmin,
  uploadVideofile("videoFile"),
  uploadVideo
);

// Update existing video (Admin only)
router.put(
  "/updateVideo/:id",
  verifyToken,
  verifyAdmin,
  validateId,
  uploadVideofile("videoFile"),
  updateVideo
);

// Delete video (Admin only)
router.delete(
  "/deleteVideo/:id",
  verifyToken,
  verifyAdmin,
  validateId,
  deleteVideo
);

export default router;
