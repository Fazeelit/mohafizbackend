import express from "express";
import {
  getAllUsers,
  LogIn,
  SignUp, 
  deleteUserById,
  resetPassword
} from "../controllers/usersController.js"; // ✅ folder name should be plural (controllers)

import validateId from "../middleware/validateId.js";

import verifyToken, { verifyAdmin } from "../middleware/auth.js";
// ✅ Initialize router
const router = express.Router();

// ✅ Define user routes
router.get("/", getAllUsers);
router.post("/login", LogIn);
router.post("/signup", SignUp);
router.put("/resetPassword",resetPassword);
router.delete("/:id", verifyToken, verifyAdmin, validateId, deleteUserById);


export default router;
