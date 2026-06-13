import { Router } from "express";
import { fetchNextQuestion, listGames, submitAnswer } from "../services/gameService.js";

const router = Router();

router.get("/list", async (_req, res, next) => {
  try {
    const games = await listGames();
    res.json({ games });
  } catch (error) {
    next(error);
  }
});

router.get("/:gameId/session", async (req, res, next) => {
  try {
    const question = await fetchNextQuestion(req.params.gameId);
    res.json(question);
  } catch (error) {
    next(error);
  }
});

router.post("/:gameId/answer", async (req, res, next) => {
  try {
    const result = await submitAnswer(req.params.gameId, req.body?.answerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
