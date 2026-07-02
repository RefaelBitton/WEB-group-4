import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GameType } from "../models/GameType.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sentenceCompletionQuestions = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sentenceCompletionQuestions.json"), "utf8")
);

const imageRecognitionQuestions = JSON.parse(
  fs.readFileSync(path.join(__dirname, "imageRecognitionQuestions.json"), "utf8")
);

const quickTranslationQuestions = JSON.parse(
  fs.readFileSync(path.join(__dirname, "quickTranslationQuestions.json"), "utf8")
);

export const gameTypes = [
  {
    id: "image-recognition",
    name: "משחק זיהוי תמונות",
    description: "בחירת המילה באנגלית שמתארת את התמונה.",
    questions: imageRecognitionQuestions,
  },
  {
    id: "sentence-completion",
    name: "השלמת משפטים",
    description: "בחירת המילה הנכונה להשלמת משפט באנגלית.",
    questions: sentenceCompletionQuestions,
  },
  {
    id: "quick-translation",
    name: "תרגום מילים בודדות",
    description: "תרגום מילים פשוטות מעברית לאנגלית.",
    questions: quickTranslationQuestions,
  },
];

export async function seedDatabase() {
  try {
    console.log("🔍 Checking GameTypes database initialization...");
    for (const gameType of gameTypes) {
      const existing = await GameType.findOne({ id: gameType.id });
      if (!existing) {
        console.log("🌱 Seeding game type: " + gameType.name + " (" + gameType.id + ")");
        await GameType.create(gameType);
      } else {
        console.log("ℹ️ Updating game type " + gameType.name + " (" + gameType.id + ") with latest seed questions...");
        existing.questions = gameType.questions;
        existing.name = gameType.name;
        existing.description = gameType.description;
        await existing.save();
      }
    }
    console.log("✅ GameTypes database seeding check completed.");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
  }
}
