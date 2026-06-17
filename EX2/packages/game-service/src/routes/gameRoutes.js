import { Router } from "express";
import { fetchNextQuestion, listGames, submitAnswer } from "../services/gameService.js";
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
