import express from "express";

import {
  getAllBooks,
  getBookById,
  uploadBook,
  updateBook,
  deleteBook,
  downloadBook
} from "../controllers/bookController.js";

import validateId from "../middleware/validateId.js";
import verifyToken, { verifyAdmin } from "../middleware/auth.js";
import uploadFile from "../util/uploadFile.js";

const router = express.Router();

/* --------------------------- Public Routes --------------------------- */

// ---------------- Download book from Cloudinary ----------------
router.get("/download/:id", downloadBook );


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
  "/updateBook/:id",
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
