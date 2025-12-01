import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true },
    file: { type: String, required: true },
    downloads: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["available", "unavailable", "active", "inactive"], // added more valid options
      default: "available",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true } // automatically adds createdAt & updatedAt
);

// Method to increment downloads
bookSchema.methods.incrementDownloads = async function () {
  this.downloads += 1;
  await this.save();
};

// Avoid model overwrite in Next.js hot reload
const Book = mongoose.model("Book", bookSchema);

export default Book;
