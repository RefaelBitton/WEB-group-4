import express from "express";
import ActivityLog from "../models/ActivityLog.js";
import { isDbConnected, inMemoryActivities } from "../utils/dbFallback.js";

const router = express.Router();

const CHAT_SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes session grouping

// POST /api/reports/activities/log
router.post("/log", async (req, res) => {
  try {
    const { userId, activityType, gameId, chatTopic, score, successRate, timeSpent, details } = req.body;

    if (!userId || !activityType) {
      return res.status(400).json({ error: "userId and activityType are required" });
    }

    let savedLog;
    const now = new Date();

    if (activityType === "chat") {
      if (isDbConnected()) {
        // Find existing chat activity for this user updated in the last 10 minutes
        const recentChat = await ActivityLog.findOne({
          userId,
          activityType: "chat",
          updatedAt: { $gte: new Date(now - CHAT_SESSION_TIMEOUT_MS) }
        });

        if (recentChat) {
          // Update existing session
          recentChat.timeSpent = (recentChat.timeSpent || 0) + (timeSpent || 15);
          
          let messages = recentChat.details?.messages || [];
          // Convert legacy single-message details if exists
          if (messages.length === 0 && recentChat.details?.message) {
            messages.push({
              message: recentChat.details.message,
              response: recentChat.details.response,
              hasErrors: recentChat.details.hasErrors,
              timestamp: recentChat.createdAt
            });
          }

          messages.push({
            message: details?.message,
            response: details?.response,
            hasErrors: details?.hasErrors,
            timestamp: now
          });

          const totalMsgs = messages.length;
          const correctMsgs = messages.filter(m => !m.hasErrors).length;
          recentChat.successRate = Math.round((correctMsgs / totalMsgs) * 100);
          recentChat.details = { messages };
          recentChat.markModified("details");
          
          await recentChat.save();
          savedLog = recentChat;
          console.log(`... Updated chat session for user ${userId}: successRate ${recentChat.successRate}%, totalTime ${recentChat.timeSpent}s`);
        } else {
          // Create new chat session
          const log = new ActivityLog({
            userId,
            activityType,
            chatTopic: chatTopic || "General English Practice",
            successRate: successRate || 100,
            timeSpent: timeSpent || 15,
            details: {
              messages: [{
                message: details?.message,
                response: details?.response,
                hasErrors: details?.hasErrors,
                timestamp: now
              }]
            }
          });
          await log.save();
          savedLog = log;
          console.log(`... Logged new chat session for user ${userId}`);
        }
      } else {
        // In-memory fallback
        const recentChat = inMemoryActivities
          .filter(act => act.userId === userId && act.activityType === "chat")
          .find(act => (now - new Date(act.updatedAt || act.createdAt)) < CHAT_SESSION_TIMEOUT_MS);

        if (recentChat) {
          recentChat.timeSpent = (recentChat.timeSpent || 0) + (timeSpent || 15);
          
          let messages = recentChat.details?.messages || [];
          if (messages.length === 0 && recentChat.details?.message) {
            messages.push({
              message: recentChat.details.message,
              response: recentChat.details.response,
              hasErrors: recentChat.details.hasErrors,
              timestamp: recentChat.createdAt
            });
          }

          messages.push({
            message: details?.message,
            response: details?.response,
            hasErrors: details?.hasErrors,
            timestamp: now
          });

          const totalMsgs = messages.length;
          const correctMsgs = messages.filter(m => !m.hasErrors).length;
          recentChat.successRate = Math.round((correctMsgs / totalMsgs) * 100);
          recentChat.details = { messages };
          recentChat.updatedAt = now;
          savedLog = recentChat;
          console.log(`... Updated in-memory chat session for user ${userId}: successRate ${recentChat.successRate}%, totalTime ${recentChat.timeSpent}s`);
        } else {
          savedLog = {
            userId,
            activityType,
            chatTopic: chatTopic || "General English Practice",
            successRate: successRate || 100,
            timeSpent: timeSpent || 15,
            details: {
              messages: [{
                message: details?.message,
                response: details?.response,
                hasErrors: details?.hasErrors,
                timestamp: now
              }]
            },
            createdAt: now,
            updatedAt: now
          };
          inMemoryActivities.push(savedLog);
          console.log(`... Logged new in-memory chat session for user ${userId}`);
        }
      }
    } else {
      // Non-chat activities (games, arena) logged normally
      if (isDbConnected()) {
        const log = new ActivityLog({
          userId,
          activityType,
          gameId,
          chatTopic,
          score,
          successRate,
          timeSpent,
          details,
        });
        await log.save();
        savedLog = log;
      } else {
        savedLog = {
          userId,
          activityType,
          gameId,
          chatTopic,
          score,
          successRate,
          timeSpent,
          details,
          createdAt: now,
          updatedAt: now
        };
        inMemoryActivities.push(savedLog);
        console.log(`... Logged in-memory activity for user ${userId}: ${activityType}`);
      }
    }

    // Emit live activity event via API Gateway socket
    const gatewayUrl = process.env.API_GATEWAY_URL || "http://localhost:4000";
    fetch(`${gatewayUrl}/api/socket/emit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "child-activity",
        data: {
          userId,
          activityType,
          gameId,
          chatTopic,
          score,
          successRate: savedLog.successRate,
          timeSpent: savedLog.timeSpent,
          timestamp: savedLog.createdAt,
        },
      }),
    }).catch((err) => {
      console.error("Error emitting socket activity event from reporting service:", err.message);
    });

    res.status(201).json({ success: true, log: savedLog });
  } catch (error) {
    console.error("Error logging activity:", error);
    res.status(500).json({ error: "Failed to log activity" });
  }
});

export default router;
