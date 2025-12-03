import Video from "../model/videosModel.js";

// 📌 ADD NEW VIDEO
// =============================
const uploadVideo = async (req, res) => {
  try {
    const { title, instructor, category, duration, status } = req.body;

    // --------- Basic Validation ----------
    if (!title || !instructor || !category || !duration) {
      return res.status(400).json({
        success: false,
        message: "Title, instructor, category, and duration are required",
      });
    }

    // --------- Video Upload Check ----------
    if (!req.fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Video upload failed or missing Cloudinary URL",
      });
    }

    // --------- Normalize & Clean Data ----------
    const normalizedStatus = ["published", "draft", "pending"].includes(
      String(status || "").toLowerCase()
    )
      ? status.toLowerCase()
      : "pending";

    // --------- Create New Video Document ----------
    const newVideo = new Video({
      title: title.trim(),
      instructor: instructor.trim(),
      category: category.trim(),
      duration: duration.trim(),
      views: 0,
      status: normalizedStatus,
      videoUrl: req.fileUrl, // ⭐ Using standard field name
    });

    await newVideo.save();

    return res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      video: newVideo,
    });

  } catch (error) {
    console.error("❌ Upload Video Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while uploading video",
      error: error.message,
    });
  }
};

export default uploadVideo;


// =============================
// 📌 GET ALL VIDEOS
// =============================
const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json({ videos });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching videos",
      error: error.message,
    });
  }
};

// =============================
// 📌 GET VIDEO BY ID
// =============================
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching video",
      error: error.message,
    });
  }
};

// =============================
// 📌 UPDATE VIDEO
// =============================
const updateVideo = async (req, res) => {
  try {
    const { title, instructor, category, duration, status } = req.body;

    let updateData = {};

    if (title) updateData.title = title;
    if (instructor) updateData.instructor = instructor;
    if (category) updateData.category = category;
    if (duration) updateData.duration = duration;

    if (status) {
      const allowedStatus = ["published", "draft", "pending"];
      updateData.status = allowedStatus.includes(status.toLowerCase())
        ? status.toLowerCase()
        : "pending";
    }

    // If a new file was uploaded
    if (req.fileUrl) {
      updateData.videoFile = req.fileUrl; // ✅ FIXED
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedVideo)
      return res.status(404).json({ message: "Video not found" });

    res.status(200).json({
      message: "Video updated successfully",
      video: updatedVideo,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating video",
      error: error.message,
    });
  }
};

// =============================
// 📌 DELETE VIDEO
// =============================
const deleteVideo = async (req, res) => {
  try {
    const deleted = await Video.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Video not found" });

    res.status(200).json({
      message: "Video deleted successfully",
      deleted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting video",
      error: error.message,
    });
  }
};

export { uploadVideo, getAllVideos, getVideoById, updateVideo, deleteVideo };
