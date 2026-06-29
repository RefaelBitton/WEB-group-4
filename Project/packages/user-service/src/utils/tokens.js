import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      parentId: user.parentId?.toString() || null,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}
