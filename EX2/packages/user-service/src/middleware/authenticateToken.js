import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/errors.js";

export function authenticateToken(req, _res, next) {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new HttpError(401, "Missing bearer token"));
  }

  try {
    req.auth = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired token"));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.auth?.role)) {
      return next(new HttpError(403, "Forbidden"));
    }

    return next();
  };
}
