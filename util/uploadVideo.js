import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import config from "../config/config.js";

// Cloudinary config
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Multer temp-disk storage (for large files, safer than memory)
const storage = multer.diskStorage({
  destination: "tmp/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files allowed"));
  },
});

// Upload middleware with Cloudinary large video support
const uploadVideo = (field = "videoFile") => {
  return (req, res, next) => {
    upload.single(field)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          error: "Multer upload failed",
          details: err.message,
        });
      }

      if (!req.file) return next();

      try {
        // ⚡ Use upload_large for big videos (>100MB)
        const result = await cloudinary.uploader.upload_large(
          req.file.path,
          {
            resource_type: "video",
            folder: "videos",
            chunk_size: 6 * 1024 * 1024, // 6 MB per chunk, good for slow connections
          },
          (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percent}%`);
          }
        );

        // Attach Cloudinary info to request
        req.fileUrl = result.secure_url;
        req.filePublicId = result.public_id;

        // Delete temp file after upload
        fs.unlink(req.file.path, (err) => {
          if (err) console.warn("Temp file deletion failed:", err);
        });

        next();
      } catch (uploadErr) {
        console.error("❌ Cloudinary large upload failed:", uploadErr);

        return res.status(500).json({
          error: "Cloudinary large video upload failed",
          details: uploadErr.message,
        });
      }
    });
  };
};

export default uploadVideo;
