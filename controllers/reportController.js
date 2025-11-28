// controllers/reportController.js
import Report from "../model/ReportModel.js";

// ---------------- CREATE REPORT ----------------
const createReport = async (req, res) => {
  try {
    const {
      complaintType,
      anonymous,
      name,
      phone,
      email,
      victimName,
      victimAge,
      address,
      district,
      description,
      files
    } = req.body;

    if (!complaintType || !victimName || !victimAge || !address || !district || !description) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newReport = new Report({
      complaintType,
      anonymous: anonymous === "true" || anonymous === true,
      name: anonymous ? "" : name,
      phone: anonymous ? "" : phone,
      email: anonymous ? "" : email,
      victimName,
      victimAge,
      address,
      district,
      description,
      files: req.imageUrl,
    });

    await newReport.save();

    res.status(201).json({ message: "Report submitted successfully", report: newReport });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- GET ALL REPORTS ----------------
const getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- GET REPORT BY ID ----------------
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ report });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//Update Report

export const updateReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const updatedData = req.body;

    const report = await Report.findByIdAndUpdate(reportId, updatedData, {
      new: true,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};



// ---------------- DELETE REPORT ----------------
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    await Report.findByIdAndDelete(id);

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- EXPORT ALL ----------------
export { createReport, getReports, getReportById, updateReport, deleteReport };
