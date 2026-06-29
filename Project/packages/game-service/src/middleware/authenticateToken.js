import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authenticateToken(req, res, next) {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    // Gracefully proceed without req.auth to allow default session key fallback
    return next();
  }

  try {
    req.auth = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (error) {
    console.error("Invalid token passed to Game Service:", error.message);
    return res.status(401).json({
      error: {
        message: "Invalid or expired authorization token",
      },
    });
  }
}
