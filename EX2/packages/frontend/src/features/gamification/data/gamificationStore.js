import { create } from "zustand";
import io from "socket.io-client";
import { 
  fetchGamificationStats, 
  awardGamificationPoints,
  fetchLeaderboard,
  fetchStoreItems,
  buyStoreItem,
  equipStoreItem,
  fetchProgressionReport
} from "../logic/gamificationApi";

const getWsUrl = () => {
  return import.meta.env.VITE_API_URL ?? "http://localhost:4000";
};

let socket = null;

export const useGamificationStore = create((set, get) => ({
  points: 0,
  rank: "Beginner",
  achievements: [],
  purchasedItems: [],
  activeTheme: "default",
  activeTrinkets: [],
  leaderboard: [],
  storeItems: [],
  progressionData: null,
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
        purchasedItems: data.purchasedItems || [],
        activeTheme: data.activeTheme || "default",
        activeTrinkets: data.activeTrinkets || [],
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
          purchasedItems: res.purchasedItems || get().purchasedItems,
          activeTheme: res.activeTheme || get().activeTheme,
          activeTrinkets: res.activeTrinkets || get().activeTrinkets,
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

  loadLeaderboard: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchLeaderboard();
      set({ leaderboard: data });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  loadStoreItems: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchStoreItems();
      set({ storeItems: data });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  buyItem: async (userId, itemId) => {
    set({ loading: true, error: null });
    try {
      const res = await buyStoreItem(userId, itemId);
      if (res.success) {
        set({
          points: res.points,
          purchasedItems: res.purchasedItems,
          activeTheme: res.activeTheme || "default",
          activeTrinkets: res.activeTrinkets || []
        });
      }
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  equipItem: async (userId, itemId, category) => {
    set({ loading: true, error: null });
    try {
      const res = await equipStoreItem(userId, itemId, category);
      if (res.success) {
        set({
          activeTheme: res.activeTheme || "default",
          activeTrinkets: res.activeTrinkets || []
        });
      }
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  loadProgressionData: async (userId) => {
    try {
      const data = await fetchProgressionReport(userId);
      set({ progressionData: data });
    } catch (err) {
      console.error("Error loading progression stats:", err);
    }
  },

  clearMilestonePopup: () => set({ milestonePopup: null }),
}));
