import express from "express";
import Progress from "../models/Progress.js";
import GameSession from "../models/GameSession.js";
import ActivityLog from "../models/ActivityLog.js";
import { isDbConnected, inMemoryProgress, inMemoryActivities } from "../utils/dbFallback.js";

const router = express.Router();

// Helper to determine rank based on points
const calculateRank = (points) => {
  if (points >= 1000) return "Grammar Hero";
  if (points >= 500) return "Advanced Learner";
  if (points >= 100) return "Intermediate Learner";
  return "Beginner";
};

// Helper to award automatic achievements (e.g. playing for 10 minutes)
const checkAndAwardAutomaticAchievements = async (progress) => {
  const userId = progress.userId.toString();
  let updated = false;
  let newAchievementAwarded = null;

  // 1. Check PLAYED_10_MINS
  if (!progress.achievements.includes("PLAYED_10_MINS")) {
    let totalPlayTimeSeconds = 0;
    if (isDbConnected()) {
      // Find all sessions of the child
      const sessions = await GameSession.find({ sessionKey: userId });
      totalPlayTimeSeconds = sessions.reduce((sum, s) => sum + (s.length || 0), 0);
    } else {
      // In-memory fallback: sum timeSpent from game activities
      totalPlayTimeSeconds = inMemoryActivities
        .filter((act) => act.userId === userId && act.activityType === "game")
        .reduce((sum, act) => sum + (act.timeSpent || 0), 0);
    }

    if (totalPlayTimeSeconds >= 600) {
      // 10 minutes = 600 seconds
      progress.achievements.push("PLAYED_10_MINS");
      progress.points += 50;
      newAchievementAwarded = "PLAYED_10_MINS";
      updated = true;
      console.log(`🏆 Automatically awarded PLAYED_10_MINS achievement to user ${userId} for ${totalPlayTimeSeconds} seconds of play.`);
    }
  }

  if (updated && isDbConnected()) {
    progress.rank = calculateRank(progress.points);
    await progress.save();
  }

  return newAchievementAwarded;
};

// GET /api/reports/gamification/:userId - Fetch rank and points
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isDbConnected()) {
      if (!inMemoryProgress.has(userId)) {
        inMemoryProgress.set(userId, { userId, points: 0, rank: "Beginner", achievements: [] });
      }
      const progress = inMemoryProgress.get(userId);
      const autoAward = await checkAndAwardAutomaticAchievements(progress);
      if (autoAward) {
        progress.achievements.push(autoAward);
        progress.points += 50;
        progress.rank = calculateRank(progress.points);
      }
      return res.json({
        points: progress.points,
        rank: progress.rank,
        achievements: progress.achievements,
      });
    }

    let progress = await Progress.findOne({ userId });

    if (!progress) {
      // Return default if not started yet
      return res.json({ points: 0, rank: "Beginner", achievements: [] });
    }

    // Automatically check and award any system achievements
    await checkAndAwardAutomaticAchievements(progress);

    res.json({
      points: progress.points,
      rank: progress.rank,
      achievements: progress.achievements,
    });
  } catch (error) {
    console.error("Error fetching gamification progress:", error);
    res.status(500).json({ error: "Failed to fetch gamification progress" });
  }
});

// POST /api/reports/gamification/award - Award points and badges
router.post("/award", async (req, res) => {
  try {
    const { userId, eventType } = req.body;

    if (!userId || !eventType) {
      return res.status(400).json({ error: "userId and eventType are required" });
    }

    if (!isDbConnected()) {
      if (!inMemoryProgress.has(userId)) {
        inMemoryProgress.set(userId, { userId, points: 0, rank: "Beginner", achievements: [] });
      }
      const progress = inMemoryProgress.get(userId);

      let pointsToAward = 0;
      let newAchievement = null;

      switch (eventType) {
        case "correct_sentence":
          pointsToAward = 10;
          if (!progress.achievements.includes("FIRST_CORRECT_SENTENCE")) {
            newAchievement = "FIRST_CORRECT_SENTENCE";
          }
          // Log chat activity
          inMemoryActivities.push({
            userId,
            activityType: "chat",
            chatTopic: "General English Practice",
            successRate: 100,
            timeSpent: 15,
            createdAt: new Date(),
          });
          break;
        case "play_10_mins":
          pointsToAward = 50;
          if (!progress.achievements.includes("PLAYED_10_MINS")) {
            newAchievement = "PLAYED_10_MINS";
          }
          break;
        case "game_completed":
          pointsToAward = 30;
          if (!progress.achievements.includes("FIRST_GAME_COMPLETED")) {
            newAchievement = "FIRST_GAME_COMPLETED";
          }
          // Log game activity
          inMemoryActivities.push({
            userId,
            activityType: "game",
            gameId: "image-recognition",
            score: 50,
            successRate: 100,
            timeSpent: 45,
            createdAt: new Date(),
          });
          break;
        case "join_arena":
          pointsToAward = 15;
          if (!progress.achievements.includes("ARENA_CHALLENGER")) {
            newAchievement = "ARENA_CHALLENGER";
          }
          // Log arena activity
          inMemoryActivities.push({
            userId,
            activityType: "arena",
            timeSpent: 120,
            createdAt: new Date(),
          });
          break;
        case "chat_streak_5":
          pointsToAward = 25;
          if (!progress.achievements.includes("CHAT_MASTER")) {
            newAchievement = "CHAT_MASTER";
          }
          break;
        case "three_games_completed":
          pointsToAward = 40;
          if (!progress.achievements.includes("VOCABULARY_EXPLORER")) {
            newAchievement = "VOCABULARY_EXPLORER";
          }
          break;
        default:
          pointsToAward = 5;
      }

      progress.points += pointsToAward;

      if (progress.points >= 100 && !progress.achievements.includes("POINT_CENTURY")) {
        progress.achievements.push("POINT_CENTURY");
        newAchievement = "POINT_CENTURY";
      } else if (progress.points >= 500 && !progress.achievements.includes("HALF_MILLENNIUM")) {
        progress.achievements.push("HALF_MILLENNIUM");
        newAchievement = "HALF_MILLENNIUM";
      }

      const newRank = calculateRank(progress.points);
      let rankUp = false;
      if (newRank !== progress.rank) {
        progress.rank = newRank;
        rankUp = true;
      }

      if (newAchievement && !progress.achievements.includes(newAchievement)) {
        progress.achievements.push(newAchievement);
      }

      const autoAward = await checkAndAwardAutomaticAchievements(progress);
      let finalNewAchievement = newAchievement || autoAward;
      let finalPointsAwarded = pointsToAward + (autoAward ? 50 : 0);

      // Emit live gamification milestone event via API Gateway socket
      if (rankUp || finalNewAchievement) {
        const gatewayUrl = process.env.API_GATEWAY_URL || "http://localhost:4000";
        fetch(`${gatewayUrl}/api/socket/emit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "gamification-milestone",
            data: {
              userId,
              totalPoints: progress.points,
              newRank: rankUp ? newRank : null,
              newAchievement: finalNewAchievement,
              achievements: progress.achievements,
            },
          }),
        }).catch((err) => {
          console.error("Error emitting milestone socket event from reporting service:", err.message);
        });
      }

      return res.json({
        success: true,
        pointsAwarded: finalPointsAwarded,
        totalPoints: progress.points,
        newRank: rankUp ? newRank : null,
        newAchievement: finalNewAchievement,
        achievements: progress.achievements,
      });
    }

    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
    }

    let pointsToAward = 0;
    let newAchievement = null;

    switch (eventType) {
      case "correct_sentence":
        pointsToAward = 10;
        if (!progress.achievements.includes("FIRST_CORRECT_SENTENCE")) {
          newAchievement = "FIRST_CORRECT_SENTENCE";
        }
        break;
      case "play_10_mins":
        pointsToAward = 50;
        if (!progress.achievements.includes("PLAYED_10_MINS")) {
          newAchievement = "PLAYED_10_MINS";
        }
        break;
      case "game_completed":
        pointsToAward = 30;
        if (!progress.achievements.includes("FIRST_GAME_COMPLETED")) {
          newAchievement = "FIRST_GAME_COMPLETED";
        }

        // Log game session to ActivityLog and mark completed
        try {
          const session =
            (await GameSession.findOne({ sessionKey: userId, status: "active" })) ||
            (await GameSession.findOne({ sessionKey: userId }).sort({ updatedAt: -1 }));
          if (session) {
            const total = session.answeredQuestions ? session.answeredQuestions.length : 0;
            const correctCount = session.answeredQuestions ? session.answeredQuestions.filter((q) => q.correct).length : 0;
            const successRate = total > 0 ? Math.round((correctCount / total) * 100) : 0;

            await ActivityLog.create({
              userId,
              activityType: "game",
              gameId: session.gameId,
              score: session.score,
              successRate,
              timeSpent: session.length || 0,
              details: {
                totalQuestions: total,
                correctCount,
                score: session.score,
                answeredQuestions: session.answeredQuestions,
              },
            });

            session.status = "completed";
            await session.save();
            console.log(`... Logged game activity and completed session ${session._id} for user ${userId}`);
          }
        } catch (err) {
          console.error("Failed to log game activity during award:", err.message);
        }
        break;
      case "join_arena":
        pointsToAward = 15;
        if (!progress.achievements.includes("ARENA_CHALLENGER")) {
          newAchievement = "ARENA_CHALLENGER";
        }

        // Log arena join to ActivityLog
        try {
          await ActivityLog.create({
            userId,
            activityType: "arena",
            timeSpent: 120, // estimated 2 minutes spent in arena room
            details: { event: "joined_arena" },
          });
          console.log(`... Logged arena activity for user ${userId}`);
        } catch (err) {
          console.error("Failed to log arena activity during award:", err.message);
        }
        break;
      case "chat_streak_5":
        pointsToAward = 25;
        if (!progress.achievements.includes("CHAT_MASTER")) {
          newAchievement = "CHAT_MASTER";
        }
        break;
      case "three_games_completed":
        pointsToAward = 40;
        if (!progress.achievements.includes("VOCABULARY_EXPLORER")) {
          newAchievement = "VOCABULARY_EXPLORER";
        }
        break;
      default:
        pointsToAward = 5; // default catch-all
    }

    progress.points += pointsToAward;

    // Check for automatic score-based achievements
    if (progress.points >= 100 && !progress.achievements.includes("POINT_CENTURY")) {
      progress.achievements.push("POINT_CENTURY");
      newAchievement = "POINT_CENTURY";
    } else if (progress.points >= 500 && !progress.achievements.includes("HALF_MILLENNIUM")) {
      progress.achievements.push("HALF_MILLENNIUM");
      newAchievement = "HALF_MILLENNIUM";
    }

    // Update Rank
    const newRank = calculateRank(progress.points);
    let rankUp = false;
    if (newRank !== progress.rank) {
      progress.rank = newRank;
      rankUp = true;
    }

    if (newAchievement && !progress.achievements.includes(newAchievement)) {
      progress.achievements.push(newAchievement);
    }

    // Check and award automatic achievements (like PLAYED_10_MINS from database log)
    const autoAward = await checkAndAwardAutomaticAchievements(progress);
    let finalNewAchievement = newAchievement || autoAward;
    let finalPointsAwarded = pointsToAward + (autoAward ? 50 : 0);

    await progress.save();

    // Emit live gamification milestone event via API Gateway socket
    if (rankUp || finalNewAchievement) {
      const gatewayUrl = process.env.API_GATEWAY_URL || "http://localhost:4000";
      fetch(`${gatewayUrl}/api/socket/emit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "gamification-milestone",
          data: {
            userId,
            totalPoints: progress.points,
            newRank: rankUp ? newRank : null,
            newAchievement: finalNewAchievement,
            achievements: progress.achievements,
          },
        }),
      }).catch((err) => {
        console.error("Error emitting milestone socket event from reporting service:", err.message);
      });
    }

    res.json({
      success: true,
      pointsAwarded: finalPointsAwarded,
      totalPoints: progress.points,
      newRank: rankUp ? newRank : null,
      newAchievement: finalNewAchievement,
      achievements: progress.achievements,
    });
  } catch (error) {
    console.error("Error awarding gamification points:", error);
    res.status(500).json({ error: "Failed to award gamification points" });
  }
});

export default router;
