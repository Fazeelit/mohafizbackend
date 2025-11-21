import express from "express";
import {
  createEmergency,
  getAllEmergencies,
  getEmergencyById,
  updateEmergency,
  deleteEmergency,
} from "../controllers/emergencyController.js";

import validateId from "../middleware/validateId.js";
import verifyToken, { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

/* -----------------------------
   📌 PUBLIC ROUTES
------------------------------ */

// Get all emergencies
router.get("/", getAllEmergencies);

// Get emergency by ID
router.get("/:id", validateId, getEmergencyById);


/* -----------------------------
   🔐 PROTECTED ROUTES
------------------------------ */

// Create emergency (any logged-in user)
router.post("/createAlert", verifyToken, createEmergency);

// Update emergency (admin only)
router.put("/updateEmergency/:id", verifyToken, verifyAdmin, validateId, updateEmergency);

// Delete emergency (admin only)
router.delete("/deleteEmergency/:id", verifyToken, verifyAdmin, validateId, deleteEmergency);

export default router;
