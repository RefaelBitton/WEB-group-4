import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import Question from './models/Question.js';
import GameSession from './models/GameSession.js';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/english_learning_bot";

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "Game Service",
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// A dummy route as placeholder for Sprint 1
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Game Service API skeleton!" });
});

const seedQuestions = async () => {
  const count = await Question.countDocuments();
  if (count > 0) return;

  const samples = [
    {
      gameId: 'sentence-completion',
      text: 'The cat is sitting ___ the table.',
      options: [
        { id: 'opt1', text: 'on' },
        { id: 'opt2', text: 'in' },
        { id: 'opt3', text: 'under' },
        { id: 'opt4', text: 'above' },
      ],
      correctOptionId: 'opt1',
      points: 10,
    },
    {
      gameId: 'quick-translation',
      text: 'כלב',
      options: [
        { id: 'opt1', text: 'Cat' },
        { id: 'opt2', text: 'Dog' },
        { id: 'opt3', text: 'Fish' },
        { id: 'opt4', text: 'Bird' },
      ],
      correctOptionId: 'opt2',
      points: 5,
    },
    {
      gameId: 'image-recognition',
      text: '',
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      options: [
        { id: 'opt1', text: 'Cat' },
        { id: 'opt2', text: 'Dog' },
        { id: 'opt3', text: 'Fish' },
        { id: 'opt4', text: 'Bird' },
      ],
      correctOptionId: 'opt1',
      points: 8,
    },
  ];

  await Question.insertMany(samples);
  console.log('Seeded sample questions for game-service');
};

// Connect to MongoDB and seed sample data
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB successfully for Game Service");
    await seedQuestions().catch((err) => {
      console.error("Failed to seed sample questions for Game Service:", err.message);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error for Game Service:", err.message);
  });

// Sample in-memory games catalog and simple session generator
const sampleGames = [
  { id: "image-recognition", name: "משחק זיהוי תמונות" },
  { id: "sentence-completion", name: "השלמת משפטים" },
  { id: "quick-translation", name: "תרגום מהיר" },
];

app.get("/list", (req, res) => {
  res.json({ games: sampleGames });
});

app.get("/:gameId/session", (req, res) => {
  const { gameId } = req.params;

  // Simple deterministic mock session per game type
  const session = {
    id: `q-${Math.random().toString(36).substr(2, 9)}`,
    text:
      gameId === "sentence-completion"
        ? "The cat is sitting ___ the table."
        : gameId === "quick-translation"
        ? "כלב"
        : "",
    imageUrl:
      gameId === "image-recognition"
        ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        : null,
    options: [
      { id: "opt1", text: gameId === "sentence-completion" ? "on" : gameId === "quick-translation" ? "Cat" : "Cat" },
      { id: "opt2", text: gameId === "sentence-completion" ? "in" : gameId === "quick-translation" ? "Dog" : "Dog" },
      { id: "opt3", text: gameId === "sentence-completion" ? "under" : gameId === "quick-translation" ? "Fish" : "Fish" },
      { id: "opt4", text: gameId === "sentence-completion" ? "above" : gameId === "quick-translation" ? "Bird" : "Bird" },
    ],
  };

  res.json(session);
});

app.post("/:gameId/answer", (req, res) => {
  const { gameId } = req.params;
  const payload = req.body || {};

  // Basic correctness logic mirroring the mock answers used in frontend
  let correct = false;
  if (gameId === "sentence-completion") {
    // assume opt1 ("on") is correct as in frontend mock
    correct = payload.answerId === "opt1";
  } else if (gameId === "quick-translation") {
    // the correct answer for כלב is Dog
    correct = payload.answerId === "opt2";
  } else if (gameId === "image-recognition") {
    // arbitrary accept opt1 as correct for demo
    correct = payload.answerId === "opt1";
  }

  res.json({ ok: true, correct, message: correct ? "נכון!" : "לא נכון, נסה שוב." });
});

app.listen(PORT, () => {
  console.log(`Game Service is running on port ${PORT}`);
});
