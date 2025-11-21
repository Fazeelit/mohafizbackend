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

// Multer in-memory storage
const storage = multer.memoryStorage();

// File type filter (PDF only)
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Upload middleware
const uploadFile = (fieldName = "file") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      // Multer errors
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message || "File upload failed",
        });
      }

      // No file uploaded
      if (!req.file) return next();

      try {
        // Upload buffer directly to Cloudinary
        const streamUpload = (buffer) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "books",
                resource_type: "raw", // IMPORTANT for PDFs
              },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );
            streamifier.createReadStream(buffer).pipe(stream);
          });
        };

        const result = await streamUpload(req.file.buffer);

        req.fileUrl = result.secure_url;      // File URL
        req.filePublicId = result.public_id;  // For delete later

        next();
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        return res.status(500).json({
          success: false,
          error: "Failed to upload PDF to Cloudinary",
        });
      }
    });
  };
};

export default uploadFile;
