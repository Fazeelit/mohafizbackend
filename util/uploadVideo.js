import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import config from "../config/config.js";

// Cloudinary config
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Multer: memory storage
const storage = multer.memoryStorage();

// 2GB max upload size
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024;

// Multer config
const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files are allowed"));
  },
});

// ⚠ Correct Cloudinary Upload (upload_stream)
// Cloudinary chunks automatically — we do NOT set chunk_size manually
const cloudinaryVideoUpload = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "videos",
        resource_type: "video",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });

// Upload Middleware
const uploadVideo = (fieldName = "videoFile") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          error: "Upload error",
          details: err.message,
        });
      }

      // No file uploaded — continue request
      if (!req.file) return next();

      try {
        const result = await cloudinaryVideoUpload(req.file.buffer);

        // Attach Cloudinary file data
        req.fileUrl = result.secure_url;
        req.filePublicId = result.public_id;

        next();
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);

        return res.status(500).json({
          error: "Failed to upload video to Cloudinary",
          details: uploadErr.message,
        });
      }
    });
  };
};

export default uploadVideo;
