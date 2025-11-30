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

// ---------------- UPDATE NEWS ----------------
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, image } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Find existing news
    const news = await NewsItem.findById(id);
    if (!news) return res.status(404).json({ success: false, message: "News not found." });

    let imageUrl = news.image; // default existing image

    // If a new image Base64 is provided, upload to Cloudinary
    if (image && image.startsWith("data:image")) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "news",
      });
      imageUrl = uploadResult.secure_url;
    }

    // Update news
    news.title = title;
    news.category = category;
    news.description = description;
    news.image = imageUrl;

    await news.save();

    return res.status(200).json({ success: true, message: "News updated successfully", data: news });
  } catch (err) {
    console.error("Update News Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update news." });
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
