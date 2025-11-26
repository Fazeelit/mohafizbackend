// controllers/bookingController.js
import Booking from "../model/BookingModel.js";

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

    // Validate Required Fields
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

    // Clean CNIC/Phone before checking DB
    const cleanCNIC = cnic.replace(/-/g, "");
    const cleanPhone = phone.replace(/-/g, "");
    const cleanWhatsapp = whatsapp.replace(/-/g, "");

    // Check duplicate CNIC
    const existingBooking = await Booking.findOne({ cnic: cleanCNIC });
    if (existingBooking) {
      return res.status(400).json({
        message: "A booking with this CNIC already exists.",
      });
    }

    // Create new booking
    const booking = new Booking({
      name,
      fname,
      cnic: cleanCNIC,
      phone: cleanPhone,
      whatsapp: cleanWhatsapp,
      qualification,
      service,
      address,
      province,
      division,
      district,
      tehsil,
    });

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
  deleteBooking,
};
