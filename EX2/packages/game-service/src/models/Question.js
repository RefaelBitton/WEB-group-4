import mongoose from "mongoose";

const { Schema } = mongoose;

const optionSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false },
);

const questionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    gameId: { type: String, required: true, index: true, trim: true, lowercase: true },
    text: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: null },
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
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Question = mongoose.model("Question", questionSchema);
