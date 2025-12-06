import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import config from "../config/config.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Multer memory storage (store file in memory for direct upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 90 * 1024 * 1024 }, // 90MB limit
});

// Upload middleware
const uploadImage = (fieldName = "file") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: "File upload failed", details: err.message });
      }

      if (!req.file) return next(); // No file uploaded

      try {
        // Upload buffer directly to Cloudinary
        const result = await cloudinary.uploader.upload_stream(
          {
            folder: "products", // Cloudinary folder
          },
          (error, result) => {
            if (error) throw error;
            req.fileUrl = result.secure_url;
            next();
          }
        );

        // Pipe buffer to Cloudinary upload stream
        result.end(req.file.buffer);
      } catch (uploadErr) {
        console.error("❌ Cloudinary upload failed:", uploadErr);
        res.status(500).json({ error: "Failed to upload to Cloudinary" });
      }
    });
  };
};

export default uploadImage;
