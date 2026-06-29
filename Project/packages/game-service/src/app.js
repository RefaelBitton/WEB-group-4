import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import { env } from "./config/env.js";
import gameRoutes from "./routes/gameRoutes.js";

export function createGameServiceApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({
      status: "UP",
      service: "Game Service",
      dbConnected: mongoose.connection.readyState === 1,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/", (_req, res) => {
    res.json({ message: "Welcome to the Game Service API" });
  });

  app.use("/api/games", gameRoutes);

  app.use((req, _res, next) => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.status = 404;
    next(error);
  });

  app.use((error, _req, res, _next) => {
    const status = error.status || 500;
    res.status(status).json({
      error: {
        message: status === 500 ? "Internal server error" : error.message,
      },
    });
  });

  return app;
}
