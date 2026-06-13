import mongoose from "mongoose";

const { Schema } = mongoose;

const gameTypeSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const GameType = mongoose.model("GameType", gameTypeSchema);
