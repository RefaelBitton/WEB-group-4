import { isDatabaseConnected } from "../config/db.js";
import { gameTypes, seedQuestions } from "../data/seedData.js";
import { GameSession } from "../models/GameSession.js";
import { GameType } from "../models/GameType.js";
import { Question } from "../models/Question.js";

const DEFAULT_SESSION_KEY = "default-child-session";
const activeSessions = new Map();
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

async function getActiveSession(gameId) {
  if (!isDatabaseConnected()) {
    return null;
  }

  const now = new Date();
  let session = await GameSession.findOne({
    sessionKey: DEFAULT_SESSION_KEY,
    gameId,
    status: "active",
  });

  if (session) {
    const lastActivity = session.updatedAt || session.createdAt;
    const timeElapsed = now - lastActivity;
    if (timeElapsed > SESSION_TIMEOUT_MS) {
      session.status = "completed";
      session.length = Math.max(0, Math.round((lastActivity - session.createdAt) / 1000));
      session.activeQuestionId = null;
      await session.save();

      session = new GameSession({
        sessionKey: DEFAULT_SESSION_KEY,
        gameId,
        status: "active",
      });
      await session.save();
    }
  } else {
    session = new GameSession({
      sessionKey: DEFAULT_SESSION_KEY,
      gameId,
      status: "active",
    });
    await session.save();
  }

  return session;
}

function publicQuestion(question) {
  return {
    id: question.id,
    text: question.text,
    imageUrl: question.imageUrl ?? null,
    options: question.options.map((option) => ({ id: option.id, text: option.text })),
  };
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function assertKnownGame(gameId) {
  if (!gameTypes.some((game) => game.id === gameId)) {
    const error = new Error(`Unknown game id: ${gameId}`);
    error.status = 404;
    throw error;
  }
}

async function getQuestionPool(gameId) {
  if (isDatabaseConnected()) {
    const dbQuestions = await Question.find({ gameId, active: true }).lean();
    if (dbQuestions.length) {
      return dbQuestions;
    }
  }

  return seedQuestions.filter((question) => question.gameId === gameId);
}

async function findQuestion(questionId) {
  if (isDatabaseConnected()) {
    const dbQuestion = await Question.findOne({ id: questionId, active: true }).lean();
    if (dbQuestion) {
      return dbQuestion;
    }
  }

  return seedQuestions.find((question) => question.id === questionId);
}

async function saveActiveQuestion(gameId, questionId) {
  activeSessions.set(gameId, questionId);

  if (!isDatabaseConnected()) {
    return;
  }

  const session = await getActiveSession(gameId);
  session.activeQuestionId = questionId;
  await session.save();
}

async function getActiveQuestionId(gameId) {
  if (isDatabaseConnected()) {
    const session = await GameSession.findOne({
      sessionKey: DEFAULT_SESSION_KEY,
      gameId,
      status: "active",
    }).lean();
    if (session?.activeQuestionId) {
      return session.activeQuestionId;
    }
  }

  return activeSessions.get(gameId);
}

export async function listGames() {
  if (isDatabaseConnected()) {
    const dbGames = await GameType.find({ active: true }).sort({ createdAt: 1 }).lean();
    if (dbGames.length) {
      return dbGames.map(({ id, name, description }) => ({ id, name, description }));
    }
  }

  return gameTypes;
}

export async function fetchNextQuestion(gameId) {
  assertKnownGame(gameId);

  const questions = await getQuestionPool(gameId);
  if (!questions.length) {
    const error = new Error(`No active questions found for game id: ${gameId}`);
    error.status = 404;
    throw error;
  }

  const question = pickRandom(questions);
  await saveActiveQuestion(gameId, question.id);

  return publicQuestion(question);
}

export async function submitAnswer(gameId, answerId) {
  assertKnownGame(gameId);

  if (!answerId) {
    const error = new Error("answerId is required");
    error.status = 400;
    throw error;
  }

  const activeQuestionId = await getActiveQuestionId(gameId);
  if (!activeQuestionId) {
    const error = new Error("No active question found. Fetch a game session before submitting an answer.");
    error.status = 409;
    throw error;
  }

  const question = await findQuestion(activeQuestionId);
  if (!question) {
    const error = new Error("Active question was not found.");
    error.status = 404;
    throw error;
  }

  const selectedOption = question.options.find((option) => option.id === answerId);
  if (!selectedOption) {
    const error = new Error("answerId does not match any option for the active question");
    error.status = 400;
    throw error;
  }

  const correctOption = question.options.find((option) => option.isCorrect);
  const correct = Boolean(selectedOption.isCorrect);
  const pointsEarned = correct ? question.points ?? 10 : 0;

  if (isDatabaseConnected()) {
    const session = await GameSession.findOne({
      sessionKey: DEFAULT_SESSION_KEY,
      gameId,
      status: "active",
    });

    if (!session) {
      const error = new Error("No active session found.");
      error.status = 404;
      throw error;
    }

    const lastActivity = session.updatedAt || session.createdAt;
    if (Date.now() - new Date(lastActivity) > SESSION_TIMEOUT_MS) {
      session.status = "completed";
      session.length = Math.max(0, Math.round((lastActivity - session.createdAt) / 1000));
      session.activeQuestionId = null;
      await session.save();

      const error = new Error("Session expired due to inactivity.");
      error.status = 409;
      throw error;
    }

    session.score += pointsEarned;
    session.answeredQuestions.push({
      questionId: question.id,
      answerId,
      correct,
      pointsEarned,
    });
    session.activeQuestionId = null;
    session.length = Math.max(0, Math.round((new Date() - session.createdAt) / 1000));
    await session.save();
  }

  activeSessions.delete(gameId);

  return {
    correct,
    pointsEarned,
    correctAnswerId: correctOption?.id ?? null,
    questionId: question.id,
  };
}
