import express from "express";
import axios from "axios";
import {
  getAllBooks,
  getBookById,
  uploadBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";

import validateId from "../middleware/validateId.js";
import verifyToken, { verifyAdmin } from "../middleware/auth.js";
import uploadFile from "../util/uploadFile.js";

const router = express.Router();

/* --------------------------- Public Routes --------------------------- */

// ---------------- Download book from Cloudinary ----------------
router.get("/download/:id", validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Fetch the book from DB to get its Cloudinary public_id
    // Example assuming getBookById returns book object
    const book = await getBookById(id); 
    if (!book || !book.filePublicId) {
      return res.status(404).json({ error: "Book not found" });
    }

    const publicId = book.filePublicId;

    // Construct Cloudinary raw PDF URL
    const pdfUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}.pdf`;

    // Fetch the PDF as a stream
    const response = await axios.get(pdfUrl, { responseType: "stream" });

    // Set headers for proper PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${book.title || "book"}.pdf"`);

    // Pipe Cloudinary stream to client
    response.data.pipe(res);
  } catch (error) {
    console.error("Download failed:", error.message);
    res.status(500).json({ error: "Failed to download PDF" });
  }
});

// Get all books
router.get("/", getAllBooks);

// Get a single book by ID
router.get("/:id", validateId, getBookById);

/* -------------------------- Admin Protected -------------------------- */

// Create new book
// Frontend should send file as "file"
router.post("/uploadBook", uploadFile("file"), verifyToken, verifyAdmin, uploadBook);

// Update book details
router.put("/:id", uploadFile("file"), verifyToken, verifyAdmin, validateId, updateBook);

// Delete book
router.delete("/deleteBook/:id", verifyToken, verifyAdmin, validateId, deleteBook);

export default router;
