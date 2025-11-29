import NewsItem from "../model/NewsModel.js";

// Create a new news item
export const createNews = async (req, res) => {
  try {
    const { title, category,description, date, published,image } = req.body;
    const news = new NewsItem({
      title,
      category,
      description,
      date,      
      published,
      image: req.fileUrl,      
    });
    const savedNews = await news.save();
    res.status(201).json({ success: true, data: savedNews });
  } catch (error) {
    console.error("Create News Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all news items
export const getAllNews = async (req, res) => {
  try {
    const news = await NewsItem.find().sort({ date: -1 }); // latest first
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    console.error("Get All News Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single news item by ID
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await NewsItem.findById(id);
    if (!news) {
      return res.status(404).json({ success: false, message: "News not found" });
    }
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    console.error("Get News By ID Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a news item by ID
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedNews = await NewsItem.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedNews) {
      return res.status(404).json({ success: false, message: "News not found" });
    }
    res.status(200).json({ success: true, data: updatedNews });
  } catch (error) {
    console.error("Update News Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a news item by ID
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNews = await NewsItem.findByIdAndDelete(id);
    if (!deletedNews) {
      return res.status(404).json({ success: false, message: "News not found" });
    }
    res.status(200).json({ success: true, message: "News deleted successfully" });
  } catch (error) {
    console.error("Delete News Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
