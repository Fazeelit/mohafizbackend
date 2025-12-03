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
});

// ---------------- Ensure Upload Folder Exists ----------------
const uploadDir = path.join(process.cwd(), "uploads");

(async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error("❌ Failed to create upload directory:", error);
  }
})();

// ---------------- Multer Disk Storage ----------------
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // Max 1GB
  fileFilter: (_, file, cb) => {
    const allowed = ["video/mp4", "video/mkv", "video/avi", "video/mov"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only video files allowed (mp4, mkv, avi, mov)"));
  },
});

// ---------------- Upload Middleware ----------------
const uploadVideo = (fieldName = "videoFile") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err)
        return res.status(400).json({ success: false, message: err.message });

      if (!req.file) return next(); // No video sent

      try {
        console.log("📤 Uploading video to Cloudinary...");

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "videos",
          resource_type: "video",
          chunk_size: 7000000, // handle large uploads
          use_filename: true,
          unique_filename: false,
        });

        req.fileUrl = result.secure_url;
        console.log("✅ Cloudinary Upload Success:", req.fileUrl);

        // Delete local file
        await fs.unlink(req.file.path).catch(() => {});
        next();
      } catch (error) {
        console.error("❌ Cloudinary Upload Failed:", error.message);

        // Clean temp file
        await fs.unlink(req.file.path).catch(() => {});

        return res.status(500).json({
          success: false,
          message: "Failed to upload video to Cloudinary",
          error: error.message,
        });
      }
    });
  };
};

export default uploadVideo;
