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

// ---------------- Multer Disk Storage ----------------
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(process.cwd(), "uploads"),
    filename: (req, file, cb) =>
      cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
  }),
  limits: { fileSize: 1024 * 1024 * 1024 }, // Max 1GB
  fileFilter: (req, file, cb) => {
    const allowed = ["video/mp4", "video/mkv", "video/avi", "video/mov"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ---------------- Upload Middleware ----------------
const uploadVideo = (fieldName = "videoFile") => (req, res, next) => {
  upload.single(fieldName)(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return next();

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "videos",
        resource_type: "video",
        chunk_size: 6000000,
      });

      req.fileUrl = result.secure_url;

      fs.unlink(req.file.path, () => {}); // delete temp file silently
      next();
    } catch (uploadErr) {
      fs.unlinkSync(req.file.path); // delete temp file on error
      return res.status(500).json({
        success: false,
        message: "Failed to upload video to Cloudinary",
        error: uploadErr.message,
      });
    }
  });
};

export default uploadVideo;
