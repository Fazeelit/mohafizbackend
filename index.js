import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import dbConnect from "./config/database.js";
import config from "./config/config.js";

import userRoutes from "./routes/usersroute.js";
import adminRoutes from "./routes/adminroute.js";
import bookRoutes from "./routes/bookRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import helplinRoutes from "./routes/helplineRoutes.js";

dotenv.config();

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
      // Allow requests with no origin (e.g., Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Preflight for all routes
app.options("*", cors({ origin: allowedOrigins, credentials: true }));

// Middleware
app.use(express.json({ limit: "50mb" })); // Increased limit for large JSON
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
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
app.use("/api/reports", reportRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/helpline", helplinRoutes);

console.log("✅ All route files loaded");

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handling
app.use((err, req, res, next) => {
  console.error("⚠️ Error:", err.message);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// Start server
const PORT = config.port || 8080;
const HOST = config.host || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
