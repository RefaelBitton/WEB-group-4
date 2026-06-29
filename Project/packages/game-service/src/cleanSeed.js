import mongoose from "mongoose";
import { connectToDatabase } from "./config/db.js";
import { GameType } from "./models/GameType.js";
import { seedDatabase } from "./data/seedData.js";

async function clean() {
  await connectToDatabase();
  console.log("🧹 Dropping existing GameTypes collection...");
  try {
    await GameType.collection.drop();
    console.log("✅ Dropped collection successfully.");
  } catch (err) {
    console.log("ℹ️ Collection did not exist or could not be dropped.");
  }
  
  await seedDatabase();
  console.log("🎉 Done! Database has been re-seeded cleanly.");
  await mongoose.disconnect();
  process.exit(0);
}

clean().catch(async (err) => {
  console.error("❌ Cleanup failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
