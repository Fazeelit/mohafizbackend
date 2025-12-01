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

    // Fetch the book from DB correctly
    const book = await findBookById(id);

    if (!book) return res.status(404).json({ error: "Book not found" });
    if (!book.filePublicId)
      return res.status(400).json({ error: "PDF not available for this book" });

    const pdfUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${book.filePublicId}.pdf`;

    // Fetch PDF
    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${book.title || "book"}.pdf"`
    );

    res.send(response.data);

  } catch (error) {
    console.error("Download failed:", error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({ error: "PDF file not found in Cloudinary" });
    }

    res.status(500).json({ error: "Failed to download PDF" });
  }
});


// ---------------- Get all books ----------------
router.get("/", getAllBooks);

// ---------------- Get single book by ID ----------------
router.get("/:id", validateId, getBookById);

/* -------------------------- Admin Protected -------------------------- */

// Create new book
// Frontend should send file as "file"
router.post(
  "/uploadBook",
  uploadFile("file"),
  verifyToken,
  verifyAdmin,
  uploadBook
);

// Update book details
router.put(
  "/:id",
  uploadFile("file"),
  verifyToken,
  verifyAdmin,
  validateId,
  updateBook
);

// Delete book
router.delete(
  "/deleteBook/:id",
  verifyToken,
  verifyAdmin,
  validateId,
  deleteBook
);

export default router;
