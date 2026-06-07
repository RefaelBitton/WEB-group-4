import { Router } from "express";
import { env } from "../config/env.js";

export function createUsersProxyRouter() {
  const router = Router();

  router.use("/api/users", async (req, res, next) => {
    try {
      const targetUrl = new URL(req.originalUrl, env.userServiceUrl);
      const headers = {};

      if (req.is("application/json")) {
        headers["content-type"] = "application/json";
      }

      const authorization = req.get("authorization");
      if (authorization) {
        headers.authorization = authorization;
      }

      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body || {}),
      });

      const body = await response.text();

      res.status(response.status);
      res.type(response.headers.get("content-type") || "application/json");
      res.send(body);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
