import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectToDatabase() {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("Connected to MongoDB successfully for Game Service");
  } catch (error) {
    console.error("MongoDB connection error for Game Service:", error.message);
    console.error("Game Service will continue with seeded in-memory questions.");
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
