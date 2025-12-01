import Book from "../model/bookModel.js";
import mongoose from "mongoose";
import axios from "axios";
//import { v2 as cloudinary } from "cloudinary";

// Helper: Validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

//z
// ✅ Get all books
//
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    if (!books.length) {
      return res.status(404).json({ message: "No books found" });
    }
    res.status(200).json({
      message: "Books fetched successfully",
      total: books.length,
      books,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching books", error: err.message });
  }
};

//
// ✅ Get a single book by ID
//
const getBookById = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id))
    return res.status(400).json({ message: "Invalid book ID" });

  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json({ message: "Book fetched successfully", book });
  } catch (err) {
    res.status(500).json({ message: "Error fetching book", error: err.message });
  }
};

//
// ✅ Upload (create) new book — Admin only
//


const uploadBook = async (req, res) => {
  try {
    const { title, author, category, language, status } = req.body;

    // Required fields check
    if (!title || !author || !category || !language) {
      return res.status(400).json({
        success: false,
        message: "Title, author, category, and language are required",
      });
    }

    // File must be uploaded (Cloudinary URL created by middleware)
    if (!req.fileUrl) {
      return res.status(400).json({
        success: false,
        message: "PDF upload failed or missing file",
      });
    }

    // Status normalization
    const allowedStatus = ["available", "unavailable", "active", "inactive"];
    const normalizedStatus = allowedStatus.includes(status?.toLowerCase())
      ? status.toLowerCase()
      : "available";

    const newBook = new Book({
      title,
      author,
      category,
      language,
      status: normalizedStatus,
      file: req.fileUrl,              // Cloudinary file URL
      filePublicId: req.filePublicId,    // Cloudinary public ID for delete
      createdBy: req.user?._id || null,  // Admin ID (optional)
    });

    await newBook.save();

    return res.status(201).json({
      success: true,
      message: "Book uploaded successfully",
      book: newBook,
    });
  } catch (err) {
    console.error("Error uploading book:", err);
    return res.status(500).json({
      success: false,
      message: "Error creating book",
      error: err.message,
    });
  }
};


// ✅ Update book details (Admin only)
//
const updateBook = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id))
    return res.status(400).json({ message: "Invalid book ID" });

  try {
    // If a new file was uploaded, assign its Cloudinary URL
    if (req.fileUrl) req.body.uploadedFileUrl = req.fileUrl;

    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook)
      return res.status(404).json({ message: "Book not found" });

    res.status(200).json({ message: "Book updated successfully", book: updatedBook });
  } catch (err) {
    res.status(500).json({ message: "Error updating book", error: err.message });
  }
};

//
// ✅ Delete book (Admin only)
//
const deleteBook = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id))
    return res.status(400).json({ message: "Invalid book ID" });

  try {
    const deleted = await Book.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Book not found" });

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting book", error: err.message });
  }
};


// ✅ Simulated download route (Public)


const downloadBook = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findById(id);
  if (!book) return res.status(404).json({ message: "Book not found" });

  await book.incrementDownloads();

  try {
    const response = await axios.get(book.file, { responseType: "stream" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${book.title}.pdf"`);

    response.data.pipe(res);
  } catch (err) {
    console.error("PDF stream error:", err);
    res.status(500).json({ message: "Failed to download PDF", error: err.message });
  }
};


export {
  getAllBooks,
  getBookById,
  uploadBook,
  updateBook,
  deleteBook,
  downloadBook,
};
