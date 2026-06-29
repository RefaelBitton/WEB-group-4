import mongoose from "mongoose";

const { Schema } = mongoose;

const optionSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    text: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: null },
    difficulty: {
      type: String,
      enum: ["beginner", "basic", "intermediate"],
      required: true,
      default: "beginner"
    },
    options: {
      type: [optionSchema],
      validate: {
        validator(options) {
          return options.length >= 2 && options.some((option) => option.isCorrect);
        },
        message: "Question requires at least two options and one correct option",
      },
    },
    points: { type: Number, default: 10, min: 0 },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const gameTypeSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    active: { type: Boolean, default: true, index: true },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

export const GameType = mongoose.model("GameType", gameTypeSchema);
