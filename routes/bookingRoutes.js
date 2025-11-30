// routes/bookingRoutes.js
import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,  
  deleteBooking,
} from "../controllers/bookingController.js";

import verifyToken, { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public route: any user can create a booking
router.post("/createBooking", createBooking);

// Admin only: get all bookings
router.get("/", verifyToken, verifyAdmin, getAllBookings);

// Get booking by ID: user can get their own, admin can get any
router.get("/:id", verifyToken, getBookingById);

//update booking
router.delete("/updateBooking,/:id", verifyToken, verifyAdmin, updateBooking,);

// Admin only: delete booking
router.delete("/deleteBooking/:id", verifyToken, verifyAdmin, deleteBooking);

export default router;
