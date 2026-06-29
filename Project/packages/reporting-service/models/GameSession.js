import mongoose from "mongoose";

const answeredQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    answerId: { type: String, required: true },
    correct: { type: Boolean, required: true },
    pointsEarned: { type: Number, default: 0 },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const gameSessionSchema = new mongoose.Schema(
  {
    sessionKey: {
      type: String,
      required: true,
      index: true,
    },
    gameId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
      index: true,
    },
    length: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    answeredQuestions: {
      type: [answeredQuestionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "gamesessions",
    strict: false,
  }
);

export default mongoose.model("GameSession", gameSessionSchema);
