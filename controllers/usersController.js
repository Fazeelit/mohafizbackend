import User from "../model/usersModel.js";
import jwt from "jsonwebtoken";
import bcrypt ,{hash} from "bcryptjs";
import mongoose from "mongoose";



// Helper: Validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if(!users){
      return res.status(404).json({ message: "Users not found" });
    }

    res.status(200).json({
      message: "Users fetched successfully",
      users
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get a user by ID
const LogIn = async (req, res) => {
  const { email, password } = req.body;

  // Field validations
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required and must be a string" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "Password is required and must be a string" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // ✅ Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        rollNum: user.rollNum,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE_IN || "7d" } // fallback expiry
    );

    // ✅ Send success response
    return res.status(200).json({
      message: "User logged in successfully",
      data: {
        token,
        user: {
          id: user._id,
          rollNum: user.rollNum,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Create a new user
const SignUp = async (req, res) => {
  const { username, email, password } = req.body;

  // Field validations
  if (!username || typeof username !== "string") {
    return res.status(400).json({ message: "Username is required and must be a string" });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required and must be a string" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "Password is required and must be a string" });
  }

  try {
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        message: "Validation error",
        error: ["Username already exists"],
      });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        message: "Validation error",
        error: ["Email already exists"],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Use async/await for hashing
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: Date.now(),
      status: "active",
      profilePicture: "default.jpg",
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully", data: newUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", error: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required and must be a string" });
    }
    if (!oldPassword || typeof oldPassword !== "string") {
      return res.status(400).json({ message: "Old password is required and must be a string" });
    }
    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({ message: "New password is required and must be a string" });
    }
    if (!confirmPassword || typeof confirmPassword !== "string") {
      return res.status(400).json({ message: "Confirm password is required and must be a string" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Verify old password (optional, only if user remembers it)
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Check if new password is different from old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password must be different from the old password" });
    }

    // Hash and update the new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ✅ Delete a user by ID
const deleteUserById = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getAllUsers,
  SignUp,
  LogIn,
  deleteUserById,
  resetPassword
};
