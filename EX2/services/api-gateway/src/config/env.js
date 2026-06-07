import dotenv from "dotenv";

dotenv.config({ path: "services/api-gateway/.env" });

export const env = {
  port: Number(process.env.PORT || 4000),
  userServiceUrl: process.env.USER_SERVICE_URL || "http://localhost:4001",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};
