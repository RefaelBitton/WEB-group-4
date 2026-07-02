import express from "express";
import mongoose from "mongoose";
import Progress from "../models/Progress.js";
import GameSession from "../models/GameSession.js";
import ActivityLog from "../models/ActivityLog.js";
import { isDbConnected, inMemoryProgress, inMemoryActivities } from "../utils/dbFallback.js";

const router = express.Router();

const STORE_ITEMS = [
  { id: "cosmic-space", category: "theme", cost: 100, name: "חלל קוסמי", description: "ערכת עיצוב סגולה-ורודה עם כוכבים נוצצים" },
  { id: "sunset-safari", category: "theme", cost: 150, name: "ספארי שקיעה", description: "ערכת עיצוב כתומה-צהובה חמימה" },
  { id: "deep-sea", category: "theme", cost: 200, name: "מצולות הים", description: "ערכת עיצוב כחולה-טורקיז מרגיעה" },
  { id: "rainbow-theme", category: "theme", cost: 300, name: "קשת בענן", description: "ערכת עיצוב צבעונית עם גווני קשת דינמיים" },
  { id: "pet-dragon", category: "trinket", cost: 200, name: "דרקון מחמד", description: "דרקון קטן וחמוד המרחף בפינת המסך" },
  { id: "sparkle-trail", category: "trinket", cost: 150, name: "שובל כוכבים", description: "שובל כוכבים נוצצים שעוקב אחרי העכבר" },
  { id: "golden-crown", category: "trinket", cost: 250, name: "כתר זהב", description: "כתר נוצץ מעל האוואטר וליד השם" },
  { id: "friendly-ghost", category: "trinket", cost: 120, name: "רוח רפאים חברותית", description: "רוח רפאים מתוקה ומרחפת שתעודד אותך" },
  { id: "snowfall-effect", category: "trinket", cost: 180, name: "פתיתי שלג נופלים", description: "פתיתי שלג עדינים שנושרים לאט על המסך" }
];

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
        inMemoryProgress.set(userId, { userId, points: 0, rank: "Beginner", achievements: [], purchasedItems: [], activeTheme: "default", activeTrinkets: [] });
      }
      const progress = inMemoryProgress.get(userId);
      const autoAward = await checkAndAwardAutomaticAchievements(progress);
      if (autoAward) {
        if (!progress.achievements.includes(autoAward)) {
          progress.achievements.push(autoAward);
          progress.points += 50;
          progress.rank = calculateRank(progress.points);
        }
      }
      return res.json({
        points: progress.points,
        rank: progress.rank,
        achievements: progress.achievements,
        purchasedItems: progress.purchasedItems || [],
        activeTheme: progress.activeTheme || "default",
        activeTrinkets: progress.activeTrinkets || []
      });
    }

    let progress = await Progress.findOne({ userId });

    if (!progress) {
      // Return default if not started yet
      return res.json({ points: 0, rank: "Beginner", achievements: [], purchasedItems: [], activeTheme: "default", activeTrinkets: [] });
    }

    // Automatically check and award any system achievements
    await checkAndAwardAutomaticAchievements(progress);

    res.json({
      points: progress.points,
      rank: progress.rank,
      achievements: progress.achievements,
      purchasedItems: progress.purchasedItems || [],
      activeTheme: progress.activeTheme || "default",
      activeTrinkets: progress.activeTrinkets || []
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
        purchasedItems: progress.purchasedItems || [],
        activeTheme: progress.activeTheme || "default",
        activeTrinkets: progress.activeTrinkets || []
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
      purchasedItems: progress.purchasedItems || [],
      activeTheme: progress.activeTheme || "default",
      activeTrinkets: progress.activeTrinkets || []
    });
  } catch (error) {
    console.error("Error awarding gamification points:", error);
    res.status(500).json({ error: "Failed to award gamification points" });
  }
});

// GET /api/reports/gamification/leaderboard - Fetch top players
router.get("/leaderboard", async (req, res) => {
  try {
    if (!isDbConnected()) {
      const fallbackList = Array.from(inMemoryProgress.values()).map(p => ({
        userId: p.userId,
        name: p.userId === "mock-child-id" ? "נועם" : (p.username || "משתמש"),
        points: p.points || 0,
        rank: p.rank || "Beginner",
        activeTrinkets: p.activeTrinkets || []
      }));
      const mockPlayers = [
        { userId: "mock1", name: "שירה", points: 780, rank: "Advanced Learner", activeTrinkets: [] },
        { userId: "mock2", name: "דניאל", points: 650, rank: "Advanced Learner", activeTrinkets: [] },
        { userId: "mock3", name: "רוני", points: 420, rank: "Intermediate Learner", activeTrinkets: [] },
        { userId: "mock4", name: "יובל", points: 95, rank: "Beginner", activeTrinkets: [] }
      ];
      const combined = [...fallbackList, ...mockPlayers].sort((a, b) => b.points - a.points);
      return res.json(combined);
    }

    const progressList = await Progress.find({}).sort({ points: -1 }).limit(10);
    const leaderboard = [];
    
    for (const prog of progressList) {
      const user = await mongoose.connection.db.collection("users").findOne({ _id: prog.userId });
      leaderboard.push({
        userId: prog.userId,
        name: user ? user.name : "תלמיד",
        points: prog.points,
        rank: prog.rank,
        activeTrinkets: prog.activeTrinkets || []
      });
    }

    res.json(leaderboard.sort((a, b) => b.points - a.points));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// GET /api/reports/gamification/store/items - Fetch available items
router.get("/store/items", (req, res) => {
  res.json(STORE_ITEMS);
});

// POST /api/reports/gamification/store/buy - Purchase item
router.post("/store/buy", async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!userId || !itemId) {
      return res.status(400).json({ error: "userId and itemId are required" });
    }

    const item = STORE_ITEMS.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (!isDbConnected()) {
      if (!inMemoryProgress.has(userId)) {
        inMemoryProgress.set(userId, { userId, points: 0, rank: "Beginner", achievements: [], purchasedItems: [], activeTheme: "default", activeTrinkets: [] });
      }
      const progress = inMemoryProgress.get(userId);
      if (!progress.purchasedItems) progress.purchasedItems = [];
      if (progress.purchasedItems.includes(itemId)) {
        return res.status(400).json({ error: "Item already purchased" });
      }
      if (progress.points < item.cost) {
        return res.status(400).json({ error: "Insufficient points" });
      }
      progress.points -= item.cost;
      progress.purchasedItems.push(itemId);
      return res.json({
        success: true,
        points: progress.points,
        purchasedItems: progress.purchasedItems,
        activeTheme: progress.activeTheme || "default",
        activeTrinkets: progress.activeTrinkets || []
      });
    }

    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
    }

    if (progress.purchasedItems.includes(itemId)) {
      return res.status(400).json({ error: "Item already purchased" });
    }

    if (progress.points < item.cost) {
      return res.status(400).json({ error: "Insufficient points" });
    }

    progress.points -= item.cost;
    progress.purchasedItems.push(itemId);
    await progress.save();

    res.json({
      success: true,
      points: progress.points,
      purchasedItems: progress.purchasedItems,
      activeTheme: progress.activeTheme,
      activeTrinkets: progress.activeTrinkets
    });
  } catch (error) {
    console.error("Error purchasing item:", error);
    res.status(500).json({ error: "Failed to purchase item" });
  }
});

// POST /api/reports/gamification/store/equip - Equip theme/trinket
router.post("/store/equip", async (req, res) => {
  try {
    const { userId, itemId, category } = req.body;
    if (!userId || !itemId || !category) {
      return res.status(400).json({ error: "userId, itemId, and category are required" });
    }

    if (!isDbConnected()) {
      if (!inMemoryProgress.has(userId)) {
        inMemoryProgress.set(userId, { userId, points: 0, rank: "Beginner", achievements: [], purchasedItems: [], activeTheme: "default", activeTrinkets: [] });
      }
      const progress = inMemoryProgress.get(userId);
      if (!progress.purchasedItems) progress.purchasedItems = [];
      if (!progress.activeTrinkets) progress.activeTrinkets = [];

      if (itemId !== "default" && !progress.purchasedItems.includes(itemId)) {
        return res.status(400).json({ error: "Item not owned" });
      }

      if (category === "theme") {
        progress.activeTheme = itemId;
      } else if (category === "trinket") {
        const index = progress.activeTrinkets.indexOf(itemId);
        if (index > -1) {
          progress.activeTrinkets.splice(index, 1);
        } else {
          progress.activeTrinkets.push(itemId);
        }
      }
      return res.json({
        success: true,
        activeTheme: progress.activeTheme || "default",
        activeTrinkets: progress.activeTrinkets || []
      });
    }

    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
    }

    if (itemId !== "default" && !progress.purchasedItems.includes(itemId)) {
      return res.status(400).json({ error: "Item not owned" });
    }

    if (category === "theme") {
      progress.activeTheme = itemId;
    } else if (category === "trinket") {
      const index = progress.activeTrinkets.indexOf(itemId);
      if (index > -1) {
        progress.activeTrinkets.splice(index, 1);
      } else {
        progress.activeTrinkets.push(itemId);
      }
    }

    await progress.save();

    res.json({
      success: true,
      activeTheme: progress.activeTheme,
      activeTrinkets: progress.activeTrinkets
    });
  } catch (error) {
    console.error("Error equipping item:", error);
    res.status(500).json({ error: "Failed to equip item" });
  }
});

export default router;
