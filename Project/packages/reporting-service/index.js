import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import Achievement from "./models/Achievement.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.REPORTING_SERVICE_PORT || 3004;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/english_learning_bot";

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "Reporting Service",
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// A dummy route as placeholder for Sprint 1
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Reporting Service API skeleton!" });
});

// Gamification routes
app.use("/gamification", gamificationRoutes);
app.use("/api/reports/gamification", gamificationRoutes);

// Activity routes
app.use("/activities", activityRoutes);
app.use("/api/reports/activities", activityRoutes);

// Reports routes
app.use("/progress", reportsRoutes);
app.use("/api/reports/progress", reportsRoutes);

// Seed default achievements
async function seedAchievements() {
  const defaultAchievements = [
    { id: "FIRST_CORRECT_SENTENCE", title: "המשפט הראשון שלי", description: "כתבת משפט נכון ראשון בצ'אט", points: 10 },
    { id: "FIRST_GAME_COMPLETED", title: "אלוף המשחקים", description: "סיימת בהצלחה משחק לימודי ראשון", points: 30 },
    { id: "PLAYED_10_MINS", title: "מתאמן מתמיד", description: "תרגלת אנגלית במשך 10 דקות לפחות", points: 50 },
    { id: "ARENA_CHALLENGER", title: "לוחם זירת השיחה", description: "הצטרפת לזירת האימון באנגלית", points: 15 },
    { id: "CHAT_MASTER", title: "אלוף השיח", description: "תרגלת 5 משפטים תקינים בצ'אט", points: 25 },
    { id: "VOCABULARY_EXPLORER", title: "חוקר אוצר המילים", description: "סיימת 3 משחקים לימודיים", points: 40 },
    { id: "POINT_CENTURY", title: "מאה ראשונה", description: "צברת 100 נקודות", points: 100 },
    { id: "HALF_MILLENNIUM", title: "חצי דרך לפסגה", description: "צברת 500 נקודות", points: 500 }
  ];

  try {
    for (const achievement of defaultAchievements) {
      await Achievement.updateOne(
        { id: achievement.id },
        { $setOnInsert: achievement },
        { upsert: true }
      );
    }
    console.log("Achievements seeded/checked successfully");
  } catch (err) {
    console.error("Error seeding achievements:", err.message);
  }
}

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully for Reporting Service");
    seedAchievements();
  })
  .catch((err) => {
    console.error("MongoDB connection error for Reporting Service:", err.message);
  });

app.listen(PORT, () => {
  console.log(`Reporting Service is running on port ${PORT}`);
});
