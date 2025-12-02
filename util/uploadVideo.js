import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import config from "../config/config.js";

// ---------------- Cloudinary Config ----------------
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// ---------------- Multer Setup ----------------
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files are allowed"));
  },
});

// ---------------- Upload Middleware ----------------
const uploadVideo = (fieldName = "file") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      // Multer errors
      if (err) {
        return res.status(400).json({
          error: "Video upload failed",
          details: err.message,
        });
      }

      // No file uploaded → skip
      if (!req.file) return next();

      try {
        const streamUpload = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "videos",
                resource_type: "video",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
        };

        const result = await streamUpload();
        req.fileUrl = result.secure_url;
        next();
      } catch (uploadErr) {
        console.error("Cloudinary Upload Error:", uploadErr);
        return res.status(500).json({
          error: "Failed to upload video to Cloudinary",
          details: uploadErr.message || uploadErr,
        });
      }
    });
  };
};

export default uploadVideo;
