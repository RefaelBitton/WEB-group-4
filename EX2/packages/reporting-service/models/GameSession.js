import mongoose from "mongoose";

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
  },
  {
    timestamps: true,
    collection: "gamesessions",
  }
);

export default mongoose.model("GameSession", gameSessionSchema);
