// model/emergencyModel.js
import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema(
  {
    emergencyType: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      default: "Unknown location",
    },
    fullAddress: {
      type: String,
      required: true,  
    },
    currentDate: {
      type: Date
    },
    currentTime: {
      type: String,
    },
    details: {
      type: String,
      default: "Hello! I have an emergency",
    },
    priority: {
      type: String,
      default: "Normal",
    },
    status: {
      type: String,
      default: "Pending",
    }    
  },
  {
    timestamps: true,
    collection: "emergencies",
  }
);

const Emergency = mongoose.model("Emergency", emergencySchema);

export default Emergency;
