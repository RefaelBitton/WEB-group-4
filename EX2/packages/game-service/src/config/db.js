import mongoose from "mongoose";
import { env } from "./env.js";
import { seedDatabase } from "../data/seedData.js";

export async function connectToDatabase() {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("Connected to MongoDB successfully for Game Service");
    
    // Automatic seeding of questions database
    await seedDatabase();
  } catch (error) {
    console.error("MongoDB connection error for Game Service:", error.message);
    console.error("Game Service will continue with seeded in-memory questions.");
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
