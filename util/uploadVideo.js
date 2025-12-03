import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import config from "../config/config.js";

// ---------------- Cloudinary Config ----------------
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
  secure: true,
});

// ---------------- Ensure Upload Folder Exists ----------------
const uploadDir = path.join(process.cwd(), "uploads");
(async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log("📁 Upload folder ready:", uploadDir);
  } catch (err) {
    console.error("❌ Failed to create upload folder:", err);
  }
})();

// ---------------- Multer Storage ----------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB max
  fileFilter: (_req, file, cb) => {
    const allowed = ["video/mp4", "video/avi", "video/mkv", "video/mov"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only video formats allowed (mp4/avi/mkv/mov)"));
  },
});

// ---------------- Upload Middleware ----------------
const uploadVideo = (fieldName = "videoFile") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      if (!req.file) {
        req.fileUrl = null;
        return next();
      }

      try {
        console.log("📤 Uploading video to Cloudinary...");

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "videos",
          resource_type: "video",   // MUST for video
          chunk_size: 10 * 1024 * 1024, // 10MB chunks for large files
          timeout: 30 * 60 * 1000,  // 30 minutes
          use_filename: true,
          unique_filename: false,
        });

        req.fileUrl = result.secure_url;
        console.log("✅ Cloudinary Upload Success:", req.fileUrl);

        // Delete local temp file safely
        await fs.unlink(req.file.path).catch(() => {});
        next();
      } catch (uploadErr) {
        console.error("❌ Cloudinary Upload Failed:", uploadErr);

        // Cleanup temp file
        await fs.unlink(req.file.path).catch(() => {});

        return res.status(500).json({
          success: false,
          message: "Failed to upload video to Cloudinary",
          cloudinaryError: uploadErr.message,
          rawError: uploadErr,
        });
      }
    });
  };
};

export default uploadVideo;
