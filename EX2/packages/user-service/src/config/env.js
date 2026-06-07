import dotenv from "dotenv";

dotenv.config();

// Fallbacks are provided below


export const env = {
  port: Number(process.env.PORT || 4001),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/english_learning_bot",
  jwtSecret: process.env.JWT_SECRET || "default_dev_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};
