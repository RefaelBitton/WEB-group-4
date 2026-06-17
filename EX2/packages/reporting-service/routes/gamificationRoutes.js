import express from 'express';
import Progress from '../models/Progress.js';
import GameSession from '../models/GameSession.js';

const router = express.Router();

// Helper to determine rank based on points
const calculateRank = (points) => {
  if (points >= 1000) return 'Grammar Hero';
  if (points >= 500) return 'Advanced Learner';
  if (points >= 100) return 'Intermediate Learner';
  return 'Beginner';
};

// Helper to award automatic achievements (e.g. playing for 10 minutes)
const checkAndAwardAutomaticAchievements = async (progress) => {
  const userId = progress.userId.toString();
  let updated = false;
  let newAchievementAwarded = null;

  // 1. Check PLAYED_10_MINS
  if (!progress.achievements.includes('PLAYED_10_MINS')) {
    // Find all sessions of the child
    const sessions = await GameSession.find({ sessionKey: userId });
    const totalPlayTimeSeconds = sessions.reduce((sum, s) => sum + (s.length || 0), 0);
    
    if (totalPlayTimeSeconds >= 600) { // 10 minutes = 600 seconds
      progress.achievements.push('PLAYED_10_MINS');
      progress.points += 50;
      newAchievementAwarded = 'PLAYED_10_MINS';
      updated = true;
      console.log(`🏆 Automatically awarded PLAYED_10_MINS achievement to user ${userId} for ${totalPlayTimeSeconds} seconds of play.`);
    }
  }

  if (updated) {
    progress.rank = calculateRank(progress.points);
    await progress.save();
  }

  return newAchievementAwarded;
};

// GET /api/reports/gamification/:userId - Fetch rank and points
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let progress = await Progress.findOne({ userId });
    
    if (!progress) {
      // Return default if not started yet
      return res.json({ points: 0, rank: 'Beginner', achievements: [] });
    }

    // Automatically check and award any system achievements
    await checkAndAwardAutomaticAchievements(progress);
    
    res.json({
      points: progress.points,
      rank: progress.rank,
      achievements: progress.achievements
    });
  } catch (error) {
    console.error('Error fetching gamification progress:', error);
    res.status(500).json({ error: 'Failed to fetch gamification progress' });
  }
});

// POST /api/reports/gamification/award - Award points and badges
router.post('/award', async (req, res) => {
  try {
    const { userId, eventType } = req.body;
    
    if (!userId || !eventType) {
      return res.status(400).json({ error: 'userId and eventType are required' });
    }

    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
    }

    let pointsToAward = 0;
    let newAchievement = null;

    switch (eventType) {
      case 'correct_sentence':
        pointsToAward = 10;
        if (!progress.achievements.includes('FIRST_CORRECT_SENTENCE')) {
          newAchievement = 'FIRST_CORRECT_SENTENCE';
        }
        break;
      case 'play_10_mins':
        pointsToAward = 50;
        if (!progress.achievements.includes('PLAYED_10_MINS')) {
          newAchievement = 'PLAYED_10_MINS';
        }
        break;
      case 'game_completed':
        pointsToAward = 30;
        if (!progress.achievements.includes('FIRST_GAME_COMPLETED')) {
          newAchievement = 'FIRST_GAME_COMPLETED';
        }
        break;
      case 'join_arena':
        pointsToAward = 15;
        if (!progress.achievements.includes('ARENA_CHALLENGER')) {
          newAchievement = 'ARENA_CHALLENGER';
        }
        break;
      case 'chat_streak_5':
        pointsToAward = 25;
        if (!progress.achievements.includes('CHAT_MASTER')) {
          newAchievement = 'CHAT_MASTER';
        }
        break;
      case 'three_games_completed':
        pointsToAward = 40;
        if (!progress.achievements.includes('VOCABULARY_EXPLORER')) {
          newAchievement = 'VOCABULARY_EXPLORER';
        }
        break;
      default:
        pointsToAward = 5; // default catch-all
    }

    progress.points += pointsToAward;

    // Check for automatic score-based achievements
    if (progress.points >= 100 && !progress.achievements.includes('POINT_CENTURY')) {
      progress.achievements.push('POINT_CENTURY');
      newAchievement = 'POINT_CENTURY';
    } else if (progress.points >= 500 && !progress.achievements.includes('HALF_MILLENNIUM')) {
      progress.achievements.push('HALF_MILLENNIUM');
      newAchievement = 'HALF_MILLENNIUM';
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

    res.json({
      success: true,
      pointsAwarded: finalPointsAwarded,
      totalPoints: progress.points,
      newRank: rankUp ? newRank : null,
      newAchievement: finalNewAchievement,
      achievements: progress.achievements
    });
  } catch (error) {
    console.error('Error awarding gamification points:', error);
    res.status(500).json({ error: 'Failed to award gamification points' });
  }
});

export default router;
