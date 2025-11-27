import Helpline from "../model/HelplineModel.js"; // adjust path if needed
import mongoose from "mongoose";

// Create a new Helpline request
const createHelpline = async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !phone || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const helplineRequest = await Helpline.create({ name, phone, email, subject, message });
    res.status(201).json({ success: true, data: helplineRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all Helpline requests
const getAllHelplineRequests = async (req, res) => {
  try {
    const requests = await Helpline.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get a Helpline request by ID
const getHelplineById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const request = await Helpline.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update a Helpline request by ID
const updateHelpline = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const updatedRequest = await Helpline.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete a Helpline request by ID
const deleteHelpline = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const deletedRequest = await Helpline.findByIdAndDelete(id);

    if (!deletedRequest) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Export all functions together
export default {
  createHelpline,
  getAllHelplineRequests,
  getHelplineById,
  updateHelpline,
  deleteHelpline,
};
