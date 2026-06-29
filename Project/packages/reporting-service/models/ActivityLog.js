import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      enum: ["chat", "game", "arena"],
      required: true,
      index: true,
    },
    gameId: {
      type: String,
      index: true,
    },
    chatTopic: {
      type: String,
    },
    score: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number, // percentage: 0 to 100
      default: 0,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: "activitylogs",
  }
);

export default mongoose.model("ActivityLog", activityLogSchema);
