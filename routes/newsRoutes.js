import express from "express";
import {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
} from "../controllers/newsController.js"; // explicit import
import validateId from "../middleware/validateId.js";
import verifyToken, { verifyAdmin } from "../middleware/auth.js";
import uploadImage from "../util/uploadImage.js";

const router = express.Router();

// Public routes
router.get("/", getAllNews);
router.get("/:id", validateId,getNewsById);

// Protected routes (Admin only)
router.post("/createNews", verifyToken, verifyAdmin,uploadImage("image"), createNews);
router.put("/updateNews/:id", verifyToken, verifyAdmin, validateId, updateNews);
router.delete("/deleteNews/:id", verifyToken, verifyAdmin, validateId, deleteNews);

export default router;
