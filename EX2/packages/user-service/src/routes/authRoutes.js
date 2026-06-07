import bcrypt from "bcryptjs";
import { Router } from "express";
import { User } from "../models/User.js";
import { authenticateToken, requireRole } from "../middleware/authenticateToken.js";
import { asyncHandler, HttpError } from "../utils/errors.js";
import { createAccessToken } from "../utils/tokens.js";

const router = Router();
const saltRounds = 12;

function publicUser(user) {
  return user.toJSON();
}

router.post(
  "/parents/register",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      throw new HttpError(400, "Name, valid email, and password are required");
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);
    const parent = await User.create({
      role: "parent",
      name,
      email,
      passwordHash,
    });

    res.status(201).json({
      user: publicUser(parent),
      accessToken: createAccessToken(parent),
    });
  }),
);

router.post(
  "/parents/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError(400, "Email and password are required");
    }

    const parent = await User.findOne({ email: email.toLowerCase(), role: "parent", active: true }).select(
      "+passwordHash",
    );

    if (!parent || !(await bcrypt.compare(password, parent.passwordHash))) {
      throw new HttpError(401, "Invalid email or password");
    }

    parent.lastLoginAt = new Date();
    await parent.save();

    res.json({
      user: publicUser(parent),
      accessToken: createAccessToken(parent),
    });
  }),
);

router.post(
  "/children",
  authenticateToken,
  requireRole("parent"),
  asyncHandler(async (req, res) => {
    const { name, username, pin, age, englishLevel } = req.body;

    if (!name || !username || !pin || String(pin).length < 4) {
      throw new HttpError(400, "Child name, username, and a 4+ digit PIN are required");
    }

    const pinHash = await bcrypt.hash(String(pin), saltRounds);
    const child = await User.create({
      role: "child",
      parentId: req.auth.sub,
      name,
      username,
      pinHash,
      age,
      englishLevel,
    });

    res.status(201).json({ user: publicUser(child) });
  }),
);

router.post(
  "/children/login",
  asyncHandler(async (req, res) => {
    const { username, pin } = req.body;

    if (!username || !pin) {
      throw new HttpError(400, "Username and PIN are required");
    }

    const child = await User.findOne({
      username: username.toLowerCase(),
      role: "child",
      active: true,
    }).select("+pinHash");

    if (!child || !(await bcrypt.compare(String(pin), child.pinHash))) {
      throw new HttpError(401, "Invalid username or PIN");
    }

    child.lastLoginAt = new Date();
    await child.save();

    res.json({
      user: publicUser(child),
      accessToken: createAccessToken(child),
    });
  }),
);

export default router;
