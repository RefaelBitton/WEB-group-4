import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { createUsersProxyRouter } from "./routes/usersProxy.js";

export function createApiGatewayApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      service: "api-gateway",
      status: "ok",
      routes: {
        users: env.userServiceUrl,
      },
    });
  });

  app.use(createUsersProxyRouter());

  app.use((req, _res, next) => {
    const error = new Error(`Gateway route not found: ${req.method} ${req.originalUrl}`);
    error.status = 404;
    next(error);
  });

  app.use((error, _req, res, _next) => {
    res.status(error.status || 502).json({
      error: {
        message: error.status ? error.message : "Gateway request failed",
      },
    });
  });

  return app;
}
