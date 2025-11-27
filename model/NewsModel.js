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
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String, // Name of lucide-react icon, e.g., "Calendar"
      default: "FileText",
    },
    color: {
      type: String, // Hex color code, e.g., "#4F46E5"
      default: "#3B82F6",
    },
    link: {
      type: String, // Optional URL
      default: "#",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Create the model
const NewsItem = mongoose.models.NewsItem || mongoose.model("NewsItem", NewsItemSchema);

// Export the model
export default NewsItem;
