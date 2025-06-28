// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const bot = require("./bot"); // Import the Telegram bot

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Start Express server
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    // Telegram bot starts polling automatically because of { polling: true }
    console.log("🤖 Telegram bot is running...");
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
