import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "API Gateway",
    timestamp: new Date().toISOString()
  });
});

// Configure targets for microservices (with fallbacks for local dev)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const BOT_SERVICE_URL = process.env.BOT_SERVICE_URL || "http://localhost:3002";
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || "http://localhost:3003";
const REPORTING_SERVICE_URL = process.env.REPORTING_SERVICE_URL || "http://localhost:3004";

// Helper function to create standard proxy configurations
const createServiceProxy = (targetUrl) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: (_path, req) => req.originalUrl,
    logger: console,
    onError: (err, req, res) => {
      console.error(`[Gateway Proxy Error] target: ${targetUrl}, path: ${req.url}`, err);
      res.status(502).json({
        error: "Bad Gateway",
        message: `Failed to connect to backend microservice at ${targetUrl}`,
        details: err.message
      });
    }
  });
};

// Route Proxying Setup
// 1. User Service
app.use("/api/users", createServiceProxy(USER_SERVICE_URL));

// 2. Bot/AI Service
app.use("/api/bot", createServiceProxy(BOT_SERVICE_URL));

// 3. Game Service
app.use("/api/games", createServiceProxy(GAME_SERVICE_URL));

// 4. Reporting Service
app.use("/api/reports", createServiceProxy(REPORTING_SERVICE_URL));

// Fallback for unhandled gateway paths
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "Requested API path does not exist on API Gateway."
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway is running on port ${PORT}`);
  console.log(`🔗 User Service Proxy target: ${USER_SERVICE_URL}`);
  console.log(`🔗 Bot Service Proxy target: ${BOT_SERVICE_URL}`);
  console.log(`🔗 Game Service Proxy target: ${GAME_SERVICE_URL}`);
  console.log(`🔗 Reporting Service Proxy target: ${REPORTING_SERVICE_URL}`);
});
