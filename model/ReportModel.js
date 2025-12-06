// models/ReportModel.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    TrackingId: {
      type: String,
      trim: true,
      unique: true, // optional but recommended
    },

    complaintType: {
      type: String,
      required: true,
      trim: true,
    },

    anonymous: {
      type: Boolean,
      default: false,
    },

    name: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    victimName: {
      type: String,
      required: true,
      trim: true,
    },

    victimAge: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    files: {
      type: [String], // <-- recommended: multiple files support
      default: [],
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Fix for Next.js hot reload (prevents model overwrite error)
const Report=mongoose.model("Report", reportSchema);

export default Report;
