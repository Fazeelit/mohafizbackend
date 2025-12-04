import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import config from "../config/config.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Multer memory storage (no disk files)
const storage = multer.memoryStorage();

// Max file size: 2 GB
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB in bytes

const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: (req, file, cb) => {
    // Accept only video files
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
});

// Upload middleware
const uploadVideo = (fieldName = "file") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        // Multer error
        return res.status(400).json({
          error: "Video upload failed",
          details: err.message,
        });
      }

      // No file uploaded → skip
      if (!req.file) return next();

      try {
        // Stream upload to Cloudinary
        const streamUpload = (buffer) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "videos", resource_type: "video" },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );
            streamifier.createReadStream(buffer).pipe(stream);
          });

        const result = await streamUpload(req.file.buffer);

        // Attach Cloudinary URL to request
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
