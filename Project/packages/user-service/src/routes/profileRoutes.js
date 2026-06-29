import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/authenticateToken.js";
import { User } from "../models/User.js";
import { asyncHandler, HttpError } from "../utils/errors.js";

const router = Router();

router.get(
  "/me",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.auth.sub);

    if (!user || !user.active) {
      throw new HttpError(404, "User not found");
    }

    res.json({ user });
  }),
);

router.patch(
  "/me",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const allowedFields = ["name", "age", "englishLevel"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.auth.sub, updates, {
      new: true,
      runValidators: true,
    });

    if (!user || !user.active) {
      throw new HttpError(404, "User not found");
    }

    res.json({ user });
  }),
);

router.get(
  "/children",
  authenticateToken,
  requireRole("parent"),
  asyncHandler(async (req, res) => {
    const children = await User.find({
      role: "child",
      parentId: req.auth.sub,
      active: true,
    }).sort({ createdAt: -1 });

    res.json({ children });
  }),
);

export default router;
