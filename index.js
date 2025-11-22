import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";

// Load environment variables
dotenv.config();

import userRoutes from "./routes/usersroute.js";
import adminRoutes from "./routes/adminroute.js";
import bookRoutes from "./routes/bookRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";

import dbConnect from "./config/database.js";
import config from "./config/config.js";

// ------------------ Connect to MongoDB ------------------
dbConnect();

const app = express();


// ------------------ CORS Setup ------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://muhafizdashboard.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked CORS request from:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ------------------ Rate Limiting ------------------
// Example: limit emergency alerts creation to 5 per minute per IP
const emergencyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    message: "Too many emergency requests from this IP. Try again later.",
  },
});

app.use("/api/emergencies", emergencyLimiter);

// ------------------ Body Parsing ------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ------------------ Logging ------------------
app.use(morgan("dev"));

// ------------------ Routes ------------------
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/emergencies", emergencyRoutes);

console.log("✅ All route files loaded");

// ------------------ 404 Handler ------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ------------------ Global Error Handler ------------------
app.use((err, req, res, next) => {
  console.error("⚠️ Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ------------------ Start Server ------------------
const PORT = config.port || 8080;
const HOST = config.host || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
