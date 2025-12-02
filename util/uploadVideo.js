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
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files allowed"));
  },
});

// ---------------- Upload Middleware ----------------
const uploadVideo = (fieldName = "videoFile") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return next();

      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "videos",
          resource_type: "video",
        });

        req.fileUrl = result.secure_url;

        // Delete local file after upload
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Failed to delete temp file:", err);
        });

        next();
      } catch (uploadErr) {
        console.error("Cloudinary Upload Error:", uploadErr);
        return res.status(500).json({
          error: "Failed to upload video to Cloudinary",
          details: uploadErr.message,
        });
      }
    });
  };
};

export default uploadVideo;
