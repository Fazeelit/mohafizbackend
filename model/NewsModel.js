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
    image:{
      type:String,
      trim:true
    }
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Create the model
const NewsItem =mongoose.model("NewsItem", NewsItemSchema);

// Export the model
export default NewsItem;
