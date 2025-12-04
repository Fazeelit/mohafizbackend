import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import config from "../config/config.js";

// Cloudinary configuration
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Multer memory storage (no temp file)
const storage = multer.memoryStorage();

// Allow max 2 GB file
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024;

// Multer upload config
const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files are allowed"));
  },
});

// Cloudinary Stream Upload with Chunk Support
const cloudinaryVideoUpload = (buffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "videos",
        resource_type: "video",
        chunk_size: 6 * 1024 * 1024, // 6MB chunks (best for slow internet)
        timeout: 120000, // 2 minute timeout per chunk
        eager_async: true, // async processing
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Pipe the buffer into Cloudinary
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

// Upload Middleware
const uploadVideo = (fieldName = "file") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          error: "Upload error",
          details: err.message,
        });
      }

      if (!req.file) return next();

      try {
        // Upload video stream to Cloudinary
        const result = await cloudinaryVideoUpload(req.file.buffer);

        // Attach Cloudinary data to req
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
