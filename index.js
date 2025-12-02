import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

dotenv.config();

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

// ------------------ Connect to MongoDB ------------------
dbConnect();

const app = express();

// ------------------ CORS ------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://muhafizdashboardproject.vercel.app",
];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// ------------------ Logging ------------------
app.use(morgan("dev"));

// ------------------ Routes ------------------
app.get("/", (req, res) => res.send("✅ Backend is running!"));

app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/helpline", helplinRoutes);

// Catch-All
app.all(/^\/api\/.*/, (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Global Error
app.use((err, req, res, next) => {
  console.error("⚠️ Error:", err.message);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// ------------------ Start Server ------------------
const PORT = config.port || 8080;
const HOST = config.host || "0.0.0.0";

const server = http.createServer(app);
server.timeout = 2 * 60 * 60 * 1000; // 2 hours

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
