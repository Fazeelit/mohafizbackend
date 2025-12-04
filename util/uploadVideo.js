import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import config from "../config/config.js";

// Cloudinary config
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Multer temp-disk storage (BEST for large files)
const storage = multer.diskStorage({
  destination: "tmp/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files allowed"));
  },
});

// Upload to Cloudinary via file path
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
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "video",
          folder: "videos",
        });

        req.fileUrl = result.secure_url;
        req.filePublicId = result.public_id;

        next();
      } catch (e) {
        console.log("❌ Cloudinary error:", e);
        return res.status(500).json({
          error: "Cloudinary upload failed",
          details: e.message,
        });
      }
    });
  };
};

export default uploadVideo;
