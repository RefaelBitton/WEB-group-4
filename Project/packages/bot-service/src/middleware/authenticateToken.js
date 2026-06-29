import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    // Proceed without req.auth, level defaults will apply
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || "default_dev_secret";
    req.auth = jwt.verify(token, secret);
    return next();
  } catch (error) {
    console.error("Invalid token passed to Bot Service:", error.message);
    return res.status(401).json({
      error: {
        message: "Invalid or expired authorization token",
      },
    });
  }
}
