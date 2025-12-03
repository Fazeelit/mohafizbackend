import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import config from "../config/config.js";

// ---------------- Cloudinary Config ----------------
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// ---------------- Ensure Upload Folder Exists ----------------
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ---------------- Multer Disk Storage ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // Max 1GB
  fileFilter: (req, file, cb) => {
    const allowed = ["video/mp4", "video/mkv", "video/avi", "video/mov"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only video files allowed (mp4, mkv, avi, mov)"));
  },
});

// ---------------- Upload Middleware ----------------
const uploadVideo = (fieldName = "videoFile") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      if (!req.file) return next(); // No file → skip upload

      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "videos",
          resource_type: "video",
          chunk_size: 6000000, // Safe for large videos
        });

        req.fileUrl = result.secure_url;

        // Delete local temp file safely
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Failed to delete temp file:", unlinkErr);
        });

        next();
      } catch (uploadErr) {
        console.error("Cloudinary Upload Error:", uploadErr);

        // Delete local file even if Cloudinary fails
        try {
          fs.unlinkSync(req.file.path);
        } catch (_) {}

        return res.status(500).json({
          success: false,
          message: "Failed to upload video to Cloudinary",
          error: uploadErr.message,
        });
      }
    });
  };
};

export default uploadVideo;
