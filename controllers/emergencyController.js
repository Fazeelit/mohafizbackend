import Emergency from "../model/emergencyModel.js";

const createEmergency = async (req, res) => {
  try {
    const { emergencyType, location,fullAddress, currentTime, currentDate, details} = req.body || {}; // <-- fallback

    if (!emergencyType || typeof emergencyType !== "string") {
      return res.status(400).json({ message: "Emergency type is required" });
    }

    const emergency = await Emergency.create({emergencyType, location,fullAddress, currentTime, currentDate, details});

    res.status(201).json({
      success: true,
      message: "Emergency created successfully",
      data: emergency,
    });
  } catch (error) {
    console.error("Create Emergency Error:", error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Get all emergencies
const getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Emergencies fetched successfully",
      data: emergencies,
    });
  } catch (error) {
    console.error("Get All Emergencies Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get emergency by ID
const getEmergencyById = async (req, res) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.findById(id);

    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    res.status(200).json({ success: true, data: emergency });
  } catch (error) {
    console.error("Get Emergency By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update emergency
const updateEmergency = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedEmergency = await Emergency.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedEmergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    res.status(200).json({ success: true, data: updatedEmergency });
  } catch (error) {
    console.error("Update Emergency Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete emergency
const deleteEmergency = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEmergency = await Emergency.findByIdAndDelete(id);

    if (!deletedEmergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    res.status(200).json({ success: true, message: "Emergency deleted successfully" });
  } catch (error) {
    console.error("Delete Emergency Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  createEmergency,
  getAllEmergencies,
  getEmergencyById,
  updateEmergency,
  deleteEmergency,
};
