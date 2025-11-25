import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();

import dbConnect from "./config/database.js";
import config from "./config/config.js";

import userRoutes from "./routes/usersroute.js";
import adminRoutes from "./routes/adminroute.js";
import bookRoutes from "./routes/bookRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

// Connect to MongoDB
dbConnect();

const app = express();

// CORS setup
const allowedOrigins = [
  "http://localhost:3000",
  "https://muhafizdashboardproject.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Root route
app.get("/", (req, res) => res.send("✅ Backend is running!"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/bookings", bookingRoutes);

console.log("✅ All route files loaded");

// Error handling
app.use((err, req, res, next) => {
  console.error("⚠️ Error:", err.message);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// Start server
const PORT = config.port || 8080;
const HOST = config.host || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
