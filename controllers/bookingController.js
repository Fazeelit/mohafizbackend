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

    const existingBooking = await Booking.findOne({ cnic });
    if (existingBooking) {
      return res.status(400).json({ message: "Booking with this CNIC already exists." });
    }

    const booking = new Booking({
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
    });

    await booking.save();
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- GET ALL BOOKINGS ----------------
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- GET BOOKING BY ID ----------------
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ---------------- DELETE BOOKING ----------------
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- EXPORT ALL ----------------
export {
  createBooking,
  getAllBookings,
  getBookingById,  
  deleteBooking,
};
