import http from "http";
import https from "https";
import { URL } from "url";
import mongoose from "mongoose";
import { isDatabaseConnected } from "../config/db.js";
import { gameTypes } from "../data/seedData.js";
import { GameSession } from "../models/GameSession.js";
import { GameType } from "../models/GameType.js";

const DEFAULT_SESSION_KEY = "default-child-session";
const activeSessions = new Map();
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

async function getActiveSession(gameId, sessionKey = DEFAULT_SESSION_KEY) {
  if (!isDatabaseConnected()) {
    return null;
  }

  const now = new Date();
  let session = await GameSession.findOne({
    sessionKey,
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
        sessionKey,
        gameId,
        status: "active",
      });
      await session.save();
    }
  } else {
    session = new GameSession({
      sessionKey,
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
    const game = await GameType.findOne({ id: gameId, active: true }).lean();
    if (game && game.questions) {
      return game.questions.filter((q) => q.active !== false);
    }
  }

  const seedGame = gameTypes.find((game) => game.id === gameId);
  return seedGame ? seedGame.questions.filter((q) => q.active !== false) : [];
}

async function findQuestion(gameId, questionId) {
  if (isDatabaseConnected()) {
    const game = await GameType.findOne({ id: gameId, active: true }).lean();
    if (game && game.questions) {
      return game.questions.find((q) => q.id === questionId);
    }
  }

  const seedGame = gameTypes.find((game) => game.id === gameId);
  return seedGame ? seedGame.questions.find((q) => q.id === questionId) : null;
}

async function saveActiveQuestion(gameId, questionId, sessionKey = DEFAULT_SESSION_KEY) {
  activeSessions.set(`${sessionKey}:${gameId}`, questionId);

  if (!isDatabaseConnected()) {
    return;
  }

  const session = await getActiveSession(gameId, sessionKey);
  session.activeQuestionId = questionId;
  await session.save();
}

async function getActiveQuestionId(gameId, sessionKey = DEFAULT_SESSION_KEY) {
  if (isDatabaseConnected()) {
    const session = await GameSession.findOne({
      sessionKey,
      gameId,
      status: "active",
    }).lean();
    if (session?.activeQuestionId) {
      return session.activeQuestionId;
    }
  }

  return activeSessions.get(`${sessionKey}:${gameId}`);
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

export async function fetchNextQuestion(gameId, sessionKey = DEFAULT_SESSION_KEY) {
  assertKnownGame(gameId);

  const questions = await getQuestionPool(gameId);
  if (!questions.length) {
    const error = new Error(`No active questions found for game id: ${gameId}`);
    error.status = 404;
    throw error;
  }

  // Determine user level from the DB if user-session is active
  let childLevel = "beginner";
  if (isDatabaseConnected() && sessionKey && mongoose.Types.ObjectId.isValid(sessionKey)) {
    try {
      const user = await mongoose.connection.db.collection("users").findOne({ _id: new mongoose.Types.ObjectId(sessionKey) });
      if (user && user.englishLevel) {
        childLevel = user.englishLevel;
      }
    } catch (err) {
      console.error("Error fetching child level from users collection:", err);
    }
  }

  // Filter the questions matching the child's english level. If none found, fallback to the entire pool.
  let filteredQuestions = questions.filter((q) => q.difficulty === childLevel);
  if (!filteredQuestions.length) {
    filteredQuestions = questions;
  }

  const question = pickRandom(filteredQuestions);
  await saveActiveQuestion(gameId, question.id, sessionKey);

  return publicQuestion(question);
}

export async function submitAnswer(gameId, answerId, sessionKey = DEFAULT_SESSION_KEY) {
  assertKnownGame(gameId);

  if (!answerId) {
    const error = new Error("answerId is required");
    error.status = 400;
    throw error;
  }

  const activeQuestionId = await getActiveQuestionId(gameId, sessionKey);
  if (!activeQuestionId) {
    const error = new Error("No active question found. Fetch a game session before submitting an answer.");
    error.status = 409;
    throw error;
  }

  const question = await findQuestion(gameId, activeQuestionId);
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
      sessionKey,
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

  activeSessions.delete(`${sessionKey}:${gameId}`);

  return {
    correct,
    pointsEarned,
    correctAnswerId: correctOption?.id ?? null,
    questionId: question.id,
  };
}

export async function fetchImage(imageUrl) {
  const url = new URL(imageUrl);
  const protocol = url.protocol === "https:" ? https : http;
  const timeoutMs = 10000;

  return new Promise((resolve, reject) => {
    const req = protocol.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      },
      (res) => {
        const statusCode = res.statusCode || 0;
        const contentType = res.headers["content-type"] || "";

        if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
          if (url.href === res.headers.location) {
            reject(new Error(`Redirect loop detected for ${imageUrl}`));
            req.destroy();
            return;
          }
          resolve(fetchImage(new URL(res.headers.location, url).href));
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(`Failed to fetch image: ${statusCode} ${res.statusMessage || ""}`));
          res.resume();
          return;
        }

        if (!contentType.includes("image")) {
          reject(new Error(`Invalid content type: expected image but got ${contentType}`));
          res.resume();
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType }));
      }
    );

    req.on("error", (err) => reject(err));
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("Image request timed out"));
    });
  });
}

