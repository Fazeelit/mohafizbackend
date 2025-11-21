import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

import userRoutes from "./routes/usersroute.js";
import adminRoutes from "./routes/adminroute.js";
import bookRoutes from "./routes/bookRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";

import dbConnect from "./config/database.js";
import config from "./config/config.js";

// Connect to database
dbConnect();

const app = express();

// ✅ Simple CORS setup for development
app.use(
  cors({
    origin: "http://localhost:3000", // your frontend URL
    credentials: true,
  })
);

// ✅ Middleware to parse JSON and URL-encoded data
// Must be BEFORE routes to populate req.body
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
app.use(morgan("dev"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/emergencies", emergencyRoutes);

console.log("Admin route file loaded:", adminRoutes);


// Error handler for unexpected errors
app.use((err, req, res, next) => {
  console.error("⚠️ Error:", err.message);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

const PORT = config.port || 3000;
const HOST = config.host || "localhost";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
