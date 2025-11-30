// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fname: {
      type: String,
      required: true,
      trim: true,
    },
    cnic: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    division: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    tehsil: {
      type: String,
      required: true,
    },

    // -------- FIXED ENUM --------
    status: {
      type: String,
      enum: ["Pending", "Selected", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
