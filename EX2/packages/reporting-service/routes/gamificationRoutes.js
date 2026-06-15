import express from 'express';
import Progress from '../models/Progress.js';

const router = express.Router();

// Helper to determine rank based on points
const calculateRank = (points) => {
  if (points >= 1000) return 'Grammar Hero';
  if (points >= 500) return 'Advanced Learner';
  if (points >= 100) return 'Intermediate Learner';
  return 'Beginner';
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
      default:
        pointsToAward = 5; // default catch-all
    }

    progress.points += pointsToAward;
    
    // Update Rank
    const newRank = calculateRank(progress.points);
    let rankUp = false;
    if (newRank !== progress.rank) {
      progress.rank = newRank;
      rankUp = true;
    }

    if (newAchievement) {
      progress.achievements.push(newAchievement);
    }

    await progress.save();

    res.json({
      success: true,
      pointsAwarded: pointsToAward,
      totalPoints: progress.points,
      newRank: rankUp ? newRank : null,
      newAchievement: newAchievement,
      achievements: progress.achievements
    });
  } catch (error) {
    console.error('Error awarding gamification points:', error);
    res.status(500).json({ error: 'Failed to award gamification points' });
  }
});

export default router;
