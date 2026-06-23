import { Router } from "express";
import { fetchNextQuestion, listGames, submitAnswer, fetchImage } from "../services/gameService.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = Router();

router.get("/list", async (_req, res, next) => {
  try {
    const games = await listGames();
    res.json({ games });
  } catch (error) {
    next(error);
  }
});

router.get("/image/proxy", async (req, res, next) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      const error = new Error("url parameter is required");
      error.status = 400;
      throw error;
    }
    const buffer = await fetchImage(imageUrl);
    res.set("Content-Type", "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

router.get("/:gameId/session", authenticateToken, async (req, res, next) => {
  try {
    const sessionKey = req.auth?.sub || undefined;
    const question = await fetchNextQuestion(req.params.gameId, sessionKey);
    res.json(question);
  } catch (error) {
    next(error);
  }
});

router.post("/:gameId/answer", authenticateToken, async (req, res, next) => {
  try {
    const sessionKey = req.auth?.sub || undefined;
    const result = await submitAnswer(req.params.gameId, req.body?.answerId, sessionKey);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
