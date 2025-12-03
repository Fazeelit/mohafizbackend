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

// ---------------- Create Upload Folder ----------------
const uploadDir = path.join(process.cwd(), "/uploads");

(async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (e) {
    console.error("❌ Upload folder creation failed:", e);
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
  limits: { fileSize: 1024 * 1024 * 2048 }, // 2GB max
  fileFilter: (_req, file, cb) => {
    const allowed = ["video/mp4", "video/avi", "video/mkv", "video/mov"];
    return allowed.includes(file.mimetype)
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

      // No file uploaded → continue request
      if (!req.file) {
        req.fileUrl = null;
        return next();
      }

      try {
        console.log("📤 Uploading file to Cloudinary...");

        const response = await cloudinary.uploader.upload(req.file.path, {
          folder: "videos",
          resource_type: "video",
          chunk_size: 6500000,
          timeout: 600000, // extra stability
        });

        req.fileUrl = response.secure_url;
        console.log("✅ Uploaded:", req.fileUrl);

        await fs.unlink(req.file.path).catch(() => {});
        next();
      } catch (error) {
        console.error("❌ Cloudinary Upload Error:", error);

        await fs.unlink(req.file.path).catch(() => {});
        return res.status(500).json({
          success: false,
          message: "Failed to upload video to Cloudinary",
          cloudinaryError: error.message,
        });
      }
    });
  };
};

export default uploadVideo;
