// models/ReportModel.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
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
      type: String },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

const Report = mongoose.model("Report", reportSchema);

export default Report;

