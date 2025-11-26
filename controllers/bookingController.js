// controllers/bookingController.js
import Booking from "../model/BookingModel.js";

// Allowed values for enums
const validQualifications = ["matric", "FA", "BA", "MA", "MS", "Phd"];
const validServices = ["Child Counseling", "Emergency Helpline", "Awareness Workshop", "On-Site Support"];

// ---------------- CREATE BOOKING ----------------
const createBooking = async (req, res) => {
  try {
    let {
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

    // Trim all string fields
    name = name?.trim();
    fname = fname?.trim();
    cnic = cnic?.toString().replace(/-/g, "").trim();
    phone = phone?.toString().replace(/-/g, "").trim();
    whatsapp = whatsapp?.toString().replace(/-/g, "").trim();
    qualification = qualification?.trim();
    service = service?.trim();
    address = address?.trim();
    province = province?.trim();
    division = division?.trim();
    district = district?.trim();
    tehsil = tehsil?.trim();

    // Required fields validation
    if (
      !name || !fname || !cnic || !phone || !whatsapp ||
      !qualification || !service || !address ||
      !province || !division || !district || !tehsil
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Enum validation
    if (!validQualifications.includes(qualification)) {
      return res.status(400).json({ message: "Invalid qualification." });
    }

    if (!validServices.includes(service)) {
      return res.status(400).json({ message: "Invalid service selected." });
    }

    // CNIC uniqueness check
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
    console.error("Create Booking Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- GET ALL BOOKINGS ----------------
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get All Bookings Error:", error);
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
    console.error("Get Booking By ID Error:", error);
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
    console.error("Delete Booking Error:", error);
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
