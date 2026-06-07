import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/english_learning_bot";

app.use(cors());
app.use(express.json());
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

// A dummy route as placeholder for Sprint 1
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Bot/AI Service API skeleton!" });
});

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
