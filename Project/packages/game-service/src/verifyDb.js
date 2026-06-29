import mongoose from "mongoose";
import { connectToDatabase } from "./config/db.js";
import { GameType } from "./models/GameType.js";

async function verify() {
  await connectToDatabase();
  
  for (const gameId of ["sentence-completion", "image-recognition", "quick-translation"]) {
    console.log(`\n📊 Checking game type: ${gameId}`);
    const gameType = await GameType.findOne({ id: gameId });
    if (gameType) {
      console.log(`  Database Questions Count: ${gameType.questions.length}`);
      const beginner = gameType.questions.filter(q => q.difficulty === 'beginner').length;
      const basic = gameType.questions.filter(q => q.difficulty === 'basic').length;
      const intermediate = gameType.questions.filter(q => q.difficulty === 'intermediate').length;
      console.log(`    Beginner: ${beginner}`);
      console.log(`    Basic: ${basic}`);
      console.log(`    Intermediate: ${intermediate}`);
    } else {
      console.log(`  ❌ Could not find ${gameId} in DB.`);
    }
  }
  
  await mongoose.disconnect();
  process.exit(0);
}

verify().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
