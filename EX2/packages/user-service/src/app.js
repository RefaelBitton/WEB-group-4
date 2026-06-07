import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

export function createUserServiceApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ service: "user-service", status: "ok" });
  });

  app.use("/api/users", authRoutes);
  app.use("/api/users", profileRoutes);

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
