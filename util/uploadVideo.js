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
  secure: true,
});

// ---------------- Ensure Upload Folder Exists ----------------
const uploadDir = path.join(process.cwd(), "uploads");
fs.promises.mkdir(uploadDir, { recursive: true }).catch(console.error);

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
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB max
  fileFilter: (_req, file, cb) => {
    const allowed = ["video/mp4", "video/avi", "video/mkv", "video/mov"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only video formats allowed (mp4/avi/mkv/mov)"));
  },
});

// ---------------- Stream Upload Middleware ----------------
const uploadVideo = (fieldName = "videoFile") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      if (!req.file) return next();

      try {
        console.log("📤 Streaming video to Cloudinary...");

        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "videos",
              resource_type: "video",
              use_filename: true,
              unique_filename: false,
            },
            (error, uploaded) => {
              if (error) reject(error);
              else resolve(uploaded);
            }
          );
          fs.createReadStream(req.file.path).pipe(stream);
        });

        req.fileUrl = result.secure_url;
        console.log("✅ Cloudinary Upload Success:", req.fileUrl);

        // Delete local temp file
        fs.promises.unlink(req.file.path).catch(() => {});
        next();
      } catch (uploadErr) {
        console.error("❌ Cloudinary Upload Failed:", uploadErr);
        fs.promises.unlink(req.file.path).catch(() => {});
        return res.status(500).json({
          success: false,
          message: "Failed to upload video to Cloudinary",
          cloudinaryError: uploadErr.message,
        });
      }
    });
  };
};

export default uploadVideo;
