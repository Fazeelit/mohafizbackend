import express from "express";
import validateId from "../middleware/validateId.js";
import verifyToken, { verifyAdmin } from "../middleware/auth.js";
import helplineController from "../controllers/helplineController.js"; // default import

const {
  createHelpline,
  getAllHelplineRequests,
  getHelplineById,  
  deleteHelpline,
} = helplineController;

const router = express.Router();

// Public route to create a new Helpline request
router.post("/createHelpline", createHelpline);

// Protected routes (admin access required)
router.get("/", verifyToken, verifyAdmin, getAllHelplineRequests);
router.get("/:id", verifyToken, verifyAdmin, validateId, getHelplineById);
router.delete("/deleteHelpline/:id", verifyToken, verifyAdmin, validateId, deleteHelpline);

export default router;
