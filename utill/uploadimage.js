import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import config from "../config/config.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Multer memory storage
const storage = multer.memoryStorage();

// Flexible upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional: limit to 5MB
});

const uploadImage = (fieldName = "file") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          error: "File upload failed",
          details: err.message,
        });
      }

      // No file uploaded → just continue
      if (!req.file) return next();

      try {
        // Ensure upload folder exists
        const uploadDir = path.join("public", "uploads");
        fs.mkdirSync(uploadDir, { recursive: true });

        // Save buffer temporarily
        const filePath = path.join(uploadDir, req.file.originalname);
        fs.writeFileSync(filePath, req.file.buffer);

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
          folder: "products", // optional: Cloudinary folder
        });

        // Attach Cloudinary URL to req
        req.image = result.secure_url;

        // Delete local temporary file
        fs.unlinkSync(filePath);

        next();
      } catch (uploadErr) {
        console.error("❌ Cloudinary upload failed:", uploadErr);
        res.status(500).json({ error: "Failed to upload to Cloudinary" });
      }
    });
  };
};

export default uploadImage;
