import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

export const env = {
  port: Number(process.env.GAME_SERVICE_PORT || process.env.PORT || 3003),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/english_learning_bot",
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
