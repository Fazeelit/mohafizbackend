import mongoose from "mongoose";

// Define the schema
const NewsItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "announcements",
        "events",
        "campaigns",
        "policies",
        "success",
        "workshops",
        "all",
      ],
      default: "all",
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    published: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
      default: "No",
    },
    image: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Create the model
const NewsItem =
  mongoose.models.NewsItem || mongoose.model("NewsItem", NewsItemSchema);

// Export the model
export default NewsItem;
