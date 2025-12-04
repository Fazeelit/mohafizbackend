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

// Multer temp-disk storage (safe for large uploads)
const storage = multer.diskStorage({
  destination: "tmp/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files allowed"));
  },
});

// ⚡ Helper: Promise wrapper for Cloudinary upload_large
const uploadLargeVideo = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      filePath,
      {
        resource_type: "video",
        folder: "videos",
        chunk_size: 6 * 1024 * 1024, // 6 MB
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
};

// Upload middleware
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
        // Upload video using Cloudinary
        const result = await uploadLargeVideo(req.file.path);

        // Attach Cloudinary info to request
        req.fileUrl = result.secure_url;
        req.filePublicId = result.public_id;

        // Delete temp file
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
