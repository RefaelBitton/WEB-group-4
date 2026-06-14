import mongoose from "mongoose";

const { Schema } = mongoose;

const answeredQuestionSchema = new Schema(
  {
    questionId: { type: String, required: true },
    answerId: { type: String, required: true },
    correct: { type: Boolean, required: true },
    pointsEarned: { type: Number, default: 0 },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const gameSessionSchema = new Schema(
  {
    sessionKey: { type: String, required: true, index: true },
    gameId: { type: String, required: true, index: true, lowercase: true, trim: true },
    activeQuestionId: { type: String, default: null },
    score: { type: Number, default: 0, min: 0 },
    answeredQuestions: { type: [answeredQuestionSchema], default: [] },
    status: { type: String, enum: ["active", "completed"], default: "active", index: true },
    length: { type: Number, default: 0 },
  },
  { timestamps: true },
);

gameSessionSchema.index(
  { sessionKey: 1, gameId: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

export const GameSession = mongoose.model("GameSession", gameSessionSchema);
