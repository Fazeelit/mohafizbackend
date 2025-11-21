import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: String, required: true },
  views: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["published", "draft", "pending"], // ✅ include "pending"
    default: "pending",
  },
  videoFile: { type: String, required: true },
}, { timestamps: true });

const Video = mongoose.model("Video", videoSchema);

export default Video;
