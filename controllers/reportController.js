// controllers/reportController.js
import Report from "../model/ReportModel.js";

// Tracking ID Generator
const generateTrackingId = (id) => `CMP${(id || "XXXXXX").slice(-6).toUpperCase()}`;

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
    } = req.body;

    // Validate required fields
    if (!complaintType || !victimName || !victimAge || !address || !district || !description) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // STEP 1 — Create report without TrackingId
    const report = new Report({
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
      files: req.imageUrl || [],
    });

    // Save initial document to get _id
    await report.save();

    // STEP 2 — Generate tracking ID using _id
    report.TrackingId = generateTrackingId(report._id.toString());

    // STEP 3 — Save again with TrackingId
    await report.save();

    res.status(201).json({
      message: "Report submitted successfully",
      report,
    });

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


// ---------------- UPDATE REPORT ----------------
const updateReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const updatedData = req.body;

    // Never allow TrackingId to be updated manually
    if (updatedData.TrackingId) delete updatedData.TrackingId;

    const report = await Report.findByIdAndUpdate(reportId, updatedData, { new: true });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// ---------------- DELETE REPORT ----------------
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    await Report.findByIdAndDelete(id);

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- EXPORT ALL ----------------
export { createReport, getReports, getReportById, updateReport, deleteReport };
