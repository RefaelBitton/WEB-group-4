import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import chatRoutes from "./src/routes/chat.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.BOT_SERVICE_PORT || process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/english_learning_bot";

app.use(cors());
app.use(express.raw({ type: "audio/*", limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "Bot/AI Service",
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// Mount Bot Routes
app.use("/api/bot", chatRoutes);

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully for Bot/AI Service");
  })
  .catch((err) => {
    console.error("MongoDB connection error for Bot/AI Service:", err.message);
  });

app.listen(PORT, () => {
  console.log(`Bot/AI Service is running on port ${PORT}`);
});
