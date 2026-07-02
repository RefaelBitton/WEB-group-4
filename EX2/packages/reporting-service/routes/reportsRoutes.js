import express from "express";
import ActivityLog from "../models/ActivityLog.js";
import GameSession from "../models/GameSession.js";
import Progress from "../models/Progress.js";
import Achievement from "../models/Achievement.js";
import { isDbConnected, inMemoryActivities, inMemoryProgress } from "../utils/dbFallback.js";

const router = express.Router();

// GET /api/reports/progress/:userId
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    let activities = [];
    let gameSessions = [];

    if (isDbConnected()) {
      // Fetch all activity logs for this user (sorted newest first)
      activities = await ActivityLog.find({ userId }).sort({ createdAt: -1 });
      // Fetch all completed game sessions for this user
      gameSessions = await GameSession.find({ sessionKey: userId, status: "completed" });
    } else {
      // In-memory fallback
      activities = inMemoryActivities
        .filter((act) => act.userId === userId)
        .sort((a, b) => b.createdAt - a.createdAt);
      
      // Build mock completed game sessions for progress calculation
      const gameActivities = activities.filter((act) => act.activityType === "game");
      gameSessions = gameActivities.map((act) => ({
        sessionKey: userId,
        gameId: act.gameId,
        status: "completed",
        score: act.score,
        length: act.timeSpent,
        answeredQuestions: [
          { correct: act.successRate === 100 }
        ]
      }));
    }

    // 1. Calculate time spent breakdown
    let totalTimeSpent = 0;
    const timeSpentBreakdown = { chat: 0, game: 0, arena: 0 };

    activities.forEach((act) => {
      totalTimeSpent += act.timeSpent || 0;
      if (timeSpentBreakdown[act.activityType] !== undefined) {
        timeSpentBreakdown[act.activityType] += act.timeSpent || 0;
      }
    });

    // 2. Calculate success rates
    // Game success rate: sum correct answers / total answers across completed sessions
    let totalGameQuestions = 0;
    let correctGameQuestions = 0;
    gameSessions.forEach((sess) => {
      if (sess.answeredQuestions && Array.isArray(sess.answeredQuestions)) {
        sess.answeredQuestions.forEach((q) => {
          totalGameQuestions += 1;
          if (q.correct) correctGameQuestions += 1;
        });
      }
    });
    const gameSuccessRate = totalGameQuestions > 0 ? Math.round((correctGameQuestions / totalGameQuestions) * 100) : 0;

    // Chat success rate: percentage of correct sentences (where successRate was 100)
    const chatActivities = activities.filter((act) => act.activityType === "chat");
    const totalChatMessages = chatActivities.length;
    const correctChatMessages = chatActivities.filter((act) => act.successRate === 100).length;
    const chatSuccessRate = totalChatMessages > 0 ? Math.round((correctChatMessages / totalChatMessages) * 100) : 0;

    // Overall success rate (combined correct game questions and correct chat messages)
    const totalItems = totalGameQuestions + totalChatMessages;
    const correctItems = correctGameQuestions + correctChatMessages;
    const overallSuccessRate = totalItems > 0 ? Math.round((correctItems / totalItems) * 100) : 0;

    // 3. Aggregate subjects covered
    const subjectsMap = {};

    // Map gameIds to friendly Hebrew names
    const GAME_MAPPING = {
      "image-recognition": "זיהוי תמונות 🖼️",
      "sentence-completion": "השלמת משפטים ✍️",
      "quick-translation": "תרגום מילים בודדות 🌐",
    };

    activities.forEach((act) => {
      if (act.activityType === "game" && act.gameId) {
        const name = GAME_MAPPING[act.gameId] || act.gameId;
        subjectsMap[name] = (subjectsMap[name] || 0) + 1;
      } else if (act.activityType === "chat") {
        const topic = act.chatTopic || "שיח כללי 💬";
        subjectsMap[topic] = (subjectsMap[topic] || 0) + 1;
      } else if (act.activityType === "arena") {
        const name = "זירת דיבור 🎙️";
        subjectsMap[name] = (subjectsMap[name] || 0) + 1;
      }
    });

    const subjectsCovered = Object.keys(subjectsMap).map((subject) => ({
      subject,
      count: subjectsMap[subject],
    }));

    // Get the 10 most recent activities
    const recentActivitiesList = activities.slice(0, 10).map((act) => ({
      activityType: act.activityType,
      gameId: act.gameId,
      chatTopic: act.chatTopic,
      score: act.score,
      successRate: act.successRate,
      timeSpent: act.timeSpent,
      timestamp: act.createdAt,
    }));

    const convertToMinutes = (seconds) => {
      if (!seconds) return 0;
      return Math.max(1, Math.round(seconds / 60));
    };

    // 4. Fetch achievements earned
    let earnedAchievements = [];
    if (isDbConnected()) {
      const progDoc = await Progress.findOne({ userId });
      if (progDoc && progDoc.achievements && progDoc.achievements.length > 0) {
        earnedAchievements = await Achievement.find({ id: { $in: progDoc.achievements } });
      }
    } else {
      const prog = inMemoryProgress.get(userId) || { achievements: [] };
      const mockAchievementsMap = {
        FIRST_CORRECT_SENTENCE: { id: "FIRST_CORRECT_SENTENCE", title: "המשפט הראשון שלי", description: "כתבת משפט נכון ראשון בצ'אט", points: 10 },
        FIRST_GAME_COMPLETED: { id: "FIRST_GAME_COMPLETED", title: "אלוף המשחקים", description: "סיימת בהצלחה משחק לימודי ראשון", points: 30 },
        PLAYED_10_MINS: { id: "PLAYED_10_MINS", title: "מתאמן מתמיד", description: "תרגלת אנגלית במשך 10 דקות לפחות", points: 50 },
        ARENA_CHALLENGER: { id: "ARENA_CHALLENGER", title: "לוחם זירת השיחה", description: "הצטרפת לזירת האימון באנגלית", points: 15 },
        CHAT_MASTER: { id: "CHAT_MASTER", title: "אלוף השיח", description: "תרגלת 5 משפטים תקינים בצ'אט", points: 25 },
        VOCABULARY_EXPLORER: { id: "VOCABULARY_EXPLORER", title: "חוקר אוצר המילים", description: "סיימת 3 משחקים לימודיים", points: 40 },
        POINT_CENTURY: { id: "POINT_CENTURY", title: "מאה ראשונה", description: "צברת 100 נקודות", points: 100 },
        HALF_MILLENNIUM: { id: "HALF_MILLENNIUM", title: "חצי דרך לפסגה", description: "צברת 500 נקודות", points: 500 }
      };
      earnedAchievements = (prog.achievements || [])
        .map(id => mockAchievementsMap[id])
        .filter(Boolean);
    }

    res.json({
      userId,
      timeSpent: {
        total: convertToMinutes(totalTimeSpent),
        breakdown: {
          chat: convertToMinutes(timeSpentBreakdown.chat),
          game: convertToMinutes(timeSpentBreakdown.game),
          arena: convertToMinutes(timeSpentBreakdown.arena),
        },
      },
      successRates: {
        overall: overallSuccessRate,
        game: gameSuccessRate,
        chat: chatSuccessRate,
      },
      subjectsCovered,
      recentActivities: recentActivitiesList.map((act) => ({
        ...act,
        timeSpent: convertToMinutes(act.timeSpent),
      })),
      achievements: earnedAchievements,
    });
  } catch (error) {
    console.error("Error compiling progress report:", error);
    res.status(500).json({ error: "Failed to compile progress report" });
  }
});

export default router;
