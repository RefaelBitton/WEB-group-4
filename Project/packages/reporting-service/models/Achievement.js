import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    icon: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "achievements",
  }
);

export default mongoose.model("Achievement", achievementSchema);
