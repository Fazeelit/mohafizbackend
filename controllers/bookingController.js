// controllers/bookingController.js
import Booking from "../model/BookingModel.js";
import mongoose from "mongoose";

// ---------------- CREATE BOOKING ----------------
const createBooking = async (req, res) => {
  try {
    const {
      name,
      fname,
      cnic,
      phone,
      whatsapp,
      qualification,
      service,
      address,
      province,
      division,
      district,
      tehsil,
    } = req.body;

    if (
      !name ||
      !fname ||
      !cnic ||
      !phone ||
      !whatsapp ||
      !qualification ||
      !service ||
      !address ||
      !province ||
      !division ||
      !district ||
      !tehsil
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const cleanCNIC = cnic.replace(/-/g, "").trim();
    const cleanPhone = phone.replace(/-/g, "").trim();
    const cleanWhatsapp = whatsapp.replace(/-/g, "").trim();

    const existingBooking = await Booking.findOne({ cnic: cleanCNIC });
    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "A booking with this CNIC already exists." });
    }

    const bookingData = {
      name: name.trim(),
      fname: fname.trim(),
      cnic: cleanCNIC,
      phone: cleanPhone,
      whatsapp: cleanWhatsapp,
      qualification: qualification.trim(),
      service: service.trim(),
      address: address.trim(),
      province: province.trim(),
      division: division.trim(),
      district: district.trim(),
      tehsil: tehsil.trim(),
    };

    const booking = new Booking(bookingData);
    await booking.save();

    res.status(201).json({
      message: "Booking created successfully",
      status: "success",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ---------------- GET ALL BOOKINGS ----------------
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({ status: "success", bookings });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ---------------- GET BOOKING BY ID ----------------
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ status: "success", booking });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ---------------- UPDATE BOOKING ----------------
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    // Fix status to match ENUM
    if (req.body.status) {
      const status = req.body.status.toLowerCase();

      if (status === "pending") req.body.status = "Pending";
      else if (status === "selected") req.body.status = "Completed"; // OR add Selected to enum
      else if (status === "completed") req.body.status = "Completed";
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({ success: true, data: updatedBooking });

  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ---------------- DELETE BOOKING ----------------
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking deleted successfully",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ---------------- EXPORT ALL ----------------
export {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking
};
