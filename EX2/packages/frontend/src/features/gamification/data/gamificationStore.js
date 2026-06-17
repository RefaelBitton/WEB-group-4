import { create } from "zustand";
import io from "socket.io-client";
import { fetchGamificationStats, awardGamificationPoints } from "../logic/gamificationApi";

const getWsUrl = () => {
  return import.meta.env.VITE_API_URL ?? "http://localhost:4000";
};

let socket = null;

export const useGamificationStore = create((set, get) => ({
  points: 0,
  rank: "Beginner",
  achievements: [],
  loading: false,
  error: null,
  milestonePopup: null, // { type: 'rank'|'badge', name: string }

  initSocket: (userId) => {
    if (socket) return;
    socket = io(getWsUrl());
    socket.on("gamification-milestone", (data) => {
      if (data.userId === userId) {
        // Update local state if a rank or achievement was earned
        set({
          points: data.totalPoints ?? get().points,
          rank: data.newRank ?? get().rank,
          achievements: data.achievements ?? get().achievements,
          milestonePopup: data.newRank 
            ? { type: "rank", name: data.newRank } 
            : data.newAchievement 
              ? { type: "badge", name: data.newAchievement } 
              : null
        });
      }
    });
  },

  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  loadStats: async (userId) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchGamificationStats(userId);
      set({
        points: data.points,
        rank: data.rank,
        achievements: data.achievements,
      });
      get().initSocket(userId);
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  triggerAward: async (userId, eventType) => {
    set({ loading: true, error: null });
    try {
      const res = await awardGamificationPoints(userId, eventType);
      if (res.success) {
        set({
          points: res.totalPoints,
          rank: res.newRank || get().rank,
          achievements: res.achievements,
        });

        // Emit event to socket gateway so it broadcasts the milestone event
        if (socket) {
          socket.emit("gamification-event", {
            userId,
            eventType,
            totalPoints: res.totalPoints,
            newRank: res.newRank,
            newAchievement: res.newAchievement,
            achievements: res.achievements,
          });
        }
      }
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  clearMilestonePopup: () => set({ milestonePopup: null }),
}));
