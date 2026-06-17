# Implementation Plan: Grammar Hero Gamification & English Practice Arena (WebRTC P2P)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the child-facing "Grammar Hero" profile view and the "English Practice Arena" peer-to-peer voice rooms, integrating them with Rafael's backend services over WebSockets and WebRTC.

**Architecture:** We use a feature-sliced architecture under `EX2/packages/frontend/src/features`. State is managed using Zustand stores, socket communication via `socket.io-client`, and audio streaming via native browser `RTCPeerConnection`.

**Tech Stack:** React, TailwindCSS, Zustand, socket.io-client, WebRTC APIs (RTCPeerConnection).

---

## Proposed Changes

### Task 0: Install dependencies and configure routing

**Files:**
- Modify: [package.json](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/package.json)
- Modify: [App.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/App.jsx)
- Modify: [ChildDashboard.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/user/presentation/ChildDashboard.jsx)

- [ ] **Step 1: Install `socket.io-client` dependency**
  Run `npm install socket.io-client -w packages/frontend` from the `EX2` directory to install the WebSockets client.

- [ ] **Step 2: Add imports and update routes in `App.jsx`**
  Modify [App.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/App.jsx) to import and configure the new routes:
  ```javascript
  import GrammarHeroProfile from './features/gamification/presentation/GrammarHeroProfile';
  import EnglishArena from './features/arena/presentation/EnglishArena';
  ```
  And declare routes inside `<Routes>`:
  ```jsx
  <Route path="/grammar-hero" element={<GrammarHeroProfile />} />
  <Route path="/arena" element={<EnglishArena />} />
  ```

- [ ] **Step 3: Update `ChildDashboard.jsx` to include buttons to the new routes**
  Modify [ChildDashboard.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/user/presentation/ChildDashboard.jsx) to add buttons for the Grammar Hero Profile and English Practice Arena:
  Import `Trophy` and `Mic` icons from `lucide-react`:
  ```javascript
  import { LogOut, Gamepad2, MessageCircle, Trophy, Mic } from 'lucide-react';
  ```
  Add two additional button cards in the grid:
  ```jsx
  <button
    onClick={() => navigate('/grammar-hero')}
    className="flex-1 group flex flex-col items-center justify-center p-10 bg-white/80 backdrop-blur-xl border-2 border-amber-100 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300"
  >
    <div className="w-24 h-24 mb-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-inner">
      <Trophy className="w-12 h-12" />
    </div>
    <span className="text-3xl font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
      גיבור הדקדוק
    </span>
    <span className="text-slate-500 mt-3 text-lg">פרופיל הישגים ונקודות</span>
  </button>

  <button
    onClick={() => navigate('/arena')}
    className="flex-1 group flex flex-col items-center justify-center p-10 bg-white/80 backdrop-blur-xl border-2 border-indigo-100 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300"
  >
    <div className="w-24 h-24 mb-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
      <Mic className="w-12 h-12" />
    </div>
    <span className="text-3xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
      זירת האימון באנגלית
    </span>
    <span className="text-slate-500 mt-3 text-lg">תרגול דיבור קבוצתי</span>
  </button>
  ```
  Ensure the parent layout classes (`flex flex-col md:flex-row gap-8 w-full`) can wrap to multiple lines nicely if needed (`grid grid-cols-1 md:grid-cols-2 gap-8 w-full`).

---

### Task 1: Create Gamification API Logic

**Files:**
- Create: [gamificationApi.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/gamification/logic/gamificationApi.js)

- [ ] **Step 1: Write `gamificationApi.js` API functions**
  Implement endpoints to fetch stats and award points:
  ```javascript
  const API_BASE = import.meta.env.VITE_API_URL ?? "";

  export async function fetchGamificationStats(userId) {
    const response = await fetch(`${API_BASE}/api/reports/gamification/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch gamification stats");
    }
    return response.json();
  }

  export async function awardGamificationPoints(userId, eventType) {
    const response = await fetch(`${API_BASE}/api/reports/gamification/award`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, eventType }),
    });
    if (!response.ok) {
      throw new Error("Failed to award gamification points");
    }
    return response.json();
  }
  ```

---

### Task 2: Create Gamification Zustand Store and Socket Listener

**Files:**
- Create: [gamificationStore.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/gamification/data/gamificationStore.js)

- [ ] **Step 1: Write `gamificationStore.js` with socket listeners**
  Create a Zustand store to load stats, award stats, and handle live milestone broadcasts:
  ```javascript
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
  ```

---

### Task 3: Build the Gamification UI (Hebrew UI)

**Files:**
- Create: [MilestoneToast.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/gamification/presentation/MilestoneToast.jsx)
- Create: [GrammarHeroProfile.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/gamification/presentation/GrammarHeroProfile.jsx)

- [ ] **Step 1: Write `MilestoneToast.jsx` popup overlay**
  Create an animated overlay to display rank up or achievement badges:
  ```jsx
  import React, { useEffect } from "react";
  import { Trophy, Star, Sparkles } from "lucide-react";

  const BADGE_MAP = {
    FIRST_CORRECT_SENTENCE: "המשפט הנכון הראשון שלי! ✍️",
    FIRST_GAME_COMPLETED: "אלוף המשחקים הראשון! 🎮",
    PLAYED_10_MINS: "10 דקות של אימון! ⏱️",
  };

  const RANK_MAP = {
    Beginner: "טירון אנגלית",
    "Intermediate Learner": "לומד בינוני",
    "Advanced Learner": "לומד מתקדם",
    "Grammar Hero": "גיבור דקדוק 🏆",
  };

  export default function MilestoneToast({ popup, onClose }) {
    useEffect(() => {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }, [onClose]);

    if (!popup) return null;

    const isRank = popup.type === "rank";
    const displayName = isRank ? RANK_MAP[popup.name] || popup.name : BADGE_MAP[popup.name] || popup.name;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-[2rem] border-2 border-amber-300 p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center gap-6 transform animate-bounce-in">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shadow-inner relative">
            <Sparkles className="w-6 h-6 absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
            {isRank ? <Trophy className="w-10 h-10" /> : <Star className="w-10 h-10" />}
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800 mb-2">כל הכבוד! 🎉</h3>
            <p className="text-slate-500 text-lg">
              {isRank ? "עלית בדרגה חדשה:" : "פתחת הישג חדש:"}
            </p>
            <p className="text-2xl font-bold text-indigo-600 mt-2">{displayName}</p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl shadow-md hover:from-amber-600 hover:to-yellow-600 transition-all text-lg"
          >
            סגור
          </button>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Write `GrammarHeroProfile.jsx` dashboard view**
  Create the Grammar Hero Profile view with fully localized Hebrew UI. Display point progress indicators, unlocked achievements list, and simulation dashboard:
  ```jsx
  import React, { useEffect } from "react";
  import { useUserStore } from "../../user/data/userStore";
  import { useGamificationStore } from "../data/gamificationStore";
  import { ArrowRight, Trophy, Award, Activity, Play } from "lucide-react";
  import { useNavigate } from "react-router-dom";
  import MilestoneToast from "./MilestoneToast";

  const RANK_MAP = {
    Beginner: "טירון אנגלית",
    "Intermediate Learner": "לומד בינוני",
    "Advanced Learner": "לומד מתקדם",
    "Grammar Hero": "גיבור דקדוק 🏆",
  };

  const ACHIEVEMENTS_DETAILS = [
    { id: "FIRST_CORRECT_SENTENCE", title: "המשפט הראשון שלי", desc: "כתבת משפט נכון ראשון בצ'אט" },
    { id: "FIRST_GAME_COMPLETED", title: "אלוף המשחקים", desc: "סיימת בהצלחה משחק לימודי ראשון" },
    { id: "PLAYED_10_MINS", title: "מתאמן מתמיד", desc: "תרגלת אנגלית במשך 10 דקות לפחות" }
  ];

  export default function GrammarHeroProfile() {
    const { user } = useUserStore();
    const { points, rank, achievements, loading, error, loadStats, triggerAward, milestonePopup, clearMilestonePopup } = useGamificationStore();
    const navigate = useNavigate();

    useEffect(() => {
      if (user?._id) {
        loadStats(user._id);
      }
    }, [user, loadStats]);

    const getPointsToNextRank = () => {
      if (points < 100) return 100 - points;
      if (points < 500) return 500 - points;
      if (points < 1000) return 1000 - points;
      return 0;
    };

    const getProgressPercent = () => {
      if (points < 100) return (points / 100) * 100;
      if (points < 500) return ((points - 100) / 400) * 100;
      if (points < 1000) return ((points - 500) / 500) * 100;
      return 100;
    };

    const nextRankName = () => {
      if (points < 100) return RANK_MAP["Intermediate Learner"];
      if (points < 500) return RANK_MAP["Advanced Learner"];
      if (points < 1000) return RANK_MAP["Grammar Hero"];
      return "הגעת לרמה המקסימלית!";
    };

    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center" dir="rtl">
        <MilestoneToast popup={milestonePopup} onClose={clearMilestonePopup} />

        <div className="w-full max-w-4xl flex justify-between items-center mb-10">
          <button
            onClick={() => navigate("/child")}
            className="flex items-center text-slate-600 hover:text-indigo-600 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group"
          >
            <ArrowRight className="h-5 w-5 ml-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">חזור ללוח הראשי</span>
          </button>
          <h1 className="text-4xl font-black text-slate-900">פרופיל גיבור הדקדוק</h1>
        </div>

        {error && (
          <div className="w-full max-w-4xl p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-center font-bold mb-6">
            {error}
          </div>
        )}

        <div className="w-full max-w-4xl grid gap-8 grid-cols-1 md:grid-cols-3">
          {/* Card 1: Score & Rank */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center text-center justify-between col-span-1">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 shadow-inner">
              <Trophy className="w-10 h-10" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">דרגה נוכחית</span>
              <h2 className="text-3xl font-extrabold text-slate-800 mt-1">{RANK_MAP[rank] || rank}</h2>
            </div>
            <div className="mt-6">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-indigo-600">
                {points}
              </span>
              <span className="text-slate-400 font-bold text-lg mr-2">נקודות</span>
            </div>
          </div>

          {/* Card 2: Level Progression Meter */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm col-span-2 flex flex-col justify-between">
            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="text-indigo-500" />
              מד התקדמות הדרגה
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-lg font-semibold text-slate-600">
                <span>הרמה הבאה: <strong className="text-indigo-600">{nextRankName()}</strong></span>
                <span>{getPointsToNextRank() > 0 ? `עוד ${getPointsToNextRank()} נקודות` : "הגעת לפסגה!"}</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden shadow-inner p-1">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 shadow-md"
                  style={{ width: `${getProgressPercent()}%` }}
                ></div>
              </div>
            </div>
            <p className="text-slate-500 text-md mt-4">המשך לפתור שאלות ולדבר עם הבוט כדי לזכות בנקודות ולטפס בדרגות!</p>
          </div>

          {/* Card 3: Achievements list */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm md:col-span-3">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Award className="text-amber-500" />
              תגי הישגים פתוחים
            </h3>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
              {ACHIEVEMENTS_DETAILS.map((badge) => {
                const isUnlocked = achievements.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center text-center p-6 border rounded-[2rem] transition-all duration-300 ${
                      isUnlocked
                        ? "bg-amber-50/50 border-amber-200 text-slate-800"
                        : "bg-slate-50/50 border-slate-200 opacity-60 grayscale"
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm ${isUnlocked ? "bg-amber-100 text-amber-500" : "bg-slate-200 text-slate-400"}`}>
                      <Award className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-extrabold">{badge.title}</h4>
                    <p className="text-sm text-slate-500 mt-2">{badge.desc}</p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full mt-4 ${isUnlocked ? "bg-amber-200 text-amber-800" : "bg-slate-200 text-slate-500"}`}>
                      {isUnlocked ? "הושלם" : "נעול"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulator Panel */}
          <div className="bg-slate-100 border border-slate-200 rounded-[2.5rem] p-8 shadow-inner md:col-span-3">
            <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Play className="text-slate-500" />
              לוח בקרה למאמן (הדמיית צבירת הישגים)
            </h3>
            <p className="text-sm text-slate-500 mb-6">השתמש בלחצנים הבאים כדי לסמל אירועים המעניקים נקודות ולבדוק את חיבור ה-WebSocket בזמן אמת.</p>
            <div className="flex flex-wrap gap-4">
              <button
                disabled={loading}
                onClick={() => user?._id && triggerAward(user._id, "correct_sentence")}
                className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
              >
                משפט נכון (+10 נקודות)
              </button>
              <button
                disabled={loading}
                onClick={() => user?._id && triggerAward(user._id, "game_completed")}
                className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
              >
                השלמת משחק (+30 נקודות)
              </button>
              <button
                disabled={loading}
                onClick={() => user?._id && triggerAward(user._id, "play_10_mins")}
                className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
              >
                תרגול 10 דקות (+50 נקודות)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

---

### Task 4: Integrate Gamification points triggers into existing features

**Files:**
- Modify: [botState.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/bot/data/botState.js)
- Modify: [gameState.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/game/data/gameState.js)

- [ ] **Step 1: Auto-award points on correct sentences in chatbot**
  Update [botState.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/bot/data/botState.js) to trigger the `correct_sentence` award endpoint:
  Import the user store and gamification store:
  ```javascript
  import { useUserStore } from "../../user/data/userStore.js";
  import { useGamificationStore } from "../../gamification/data/gamificationStore.js";
  ```
  Inside `sendMessage`, after a successful bot answer is received and messages are updated, check if the child has written a message:
  ```javascript
  // Award gamification points for chatting
  const currentChildId = useUserStore.getState().user?._id;
  if (currentChildId) {
    useGamificationStore.getState().triggerAward(currentChildId, "correct_sentence");
  }
  ```

- [ ] **Step 2: Auto-award points on game completion**
  Update [gameState.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/game/data/gameState.js) to award `game_completed` points:
  Import the stores:
  ```javascript
  import { useUserStore } from "../../user/data/userStore.js";
  import { useGamificationStore } from "../../gamification/data/gamificationStore.js";
  ```
  In `answerGame`, after `submitGameAnswer` is successfully executed:
  ```javascript
  // Award gamification points for game completion
  const currentChildId = useUserStore.getState().user?._id;
  if (currentChildId) {
    useGamificationStore.getState().triggerAward(currentChildId, "game_completed");
  }
  ```

---

### Task 5: WebRTC P2P Handler Logic

**Files:**
- Create: [webrtcHandler.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/arena/logic/webrtcHandler.js)

- [ ] **Step 1: Write WebRTC handler client wrapper**
  Write a low-level handler wrapping `RTCPeerConnection` and audio stream events:
  ```javascript
  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ],
  };

  export class WebRTCHandler {
    constructor(socket, peerSocketId, onStreamCallback, onConnectionStateChange) {
      this.socket = socket;
      this.peerSocketId = peerSocketId;
      this.onStreamCallback = onStreamCallback;
      this.onConnectionStateChange = onConnectionStateChange;
      this.peerConnection = null;
      this.localStream = null;
    }

    async init(localStream) {
      this.localStream = localStream;
      this.peerConnection = new RTCPeerConnection(configuration);

      // Add local tracks
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Track connection status
      this.peerConnection.onconnectionstatechange = () => {
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange(this.peerConnection.connectionState);
        }
      };

      // Remote stream arrival
      this.peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          this.onStreamCallback(event.streams[0]);
        }
      };

      // Send local ICE candidates to peer
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit("ice-candidate", {
            target: this.peerSocketId,
            candidate: event.candidate,
          });
        }
      };
    }

    async createOffer() {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.socket.emit("offer", {
        target: this.peerSocketId,
        sdp: offer,
      });
    }

    async handleOffer(sdp) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.socket.emit("answer", {
        target: this.peerSocketId,
        sdp: answer,
      });
    }

    async handleAnswer(sdp) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    }

    async handleIceCandidate(candidate) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding received ICE candidate", e);
      }
    }

    close() {
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
    }
  }
  ```

---

### Task 6: Create Arena Zustand Store

**Files:**
- Create: [arenaStore.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/arena/data/arenaStore.js)

- [ ] **Step 1: Write `arenaStore.js` logic**
  Implement the room state, websocket connection signaling handlers, and WebRTC integration:
  ```javascript
  import { create } from "zustand";
  import io from "socket.io-client";
  import { WebRTCHandler } from "../logic/webrtcHandler";

  const getWsUrl = () => {
    return import.meta.env.VITE_API_URL ?? "http://localhost:4000";
  };

  let socket = null;
  let activeConnection = null;
  let localAudioStream = null;

  export const useArenaStore = create((set, get) => ({
    roomId: null,
    status: "disconnected", // 'disconnected' | 'connecting' | 'waiting' | 'negotiating' | 'connected' | 'error'
    error: null,
    remoteStream: null,
    isMuted: false,

    joinRoom: async (roomName, childId) => {
      set({ status: "connecting", roomId: roomName, error: null, remoteStream: null });
      try {
        localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        socket = io(getWsUrl());
        
        socket.emit("join-room", roomName, childId);
        set({ status: "waiting" });

        // When a peer joins, we become the caller
        socket.on("user-joined", async (userId, peerSocketId) => {
          set({ status: "negotiating" });
          activeConnection = new WebRTCHandler(
            socket,
            peerSocketId,
            (stream) => set({ remoteStream: stream, status: "connected" }),
            (state) => {
              if (state === "connected") set({ status: "connected" });
              if (state === "disconnected" || state === "failed") get().leaveRoom();
            }
          );
          await activeConnection.init(localAudioStream);
          await activeConnection.createOffer();
        });

        // Receiving incoming offer
        socket.on("offer", async (payload) => {
          set({ status: "negotiating" });
          activeConnection = new WebRTCHandler(
            socket,
            payload.callerId,
            (stream) => set({ remoteStream: stream, status: "connected" }),
            (state) => {
              if (state === "connected") set({ status: "connected" });
              if (state === "disconnected" || state === "failed") get().leaveRoom();
            }
          );
          await activeConnection.init(localAudioStream);
          await activeConnection.handleOffer(payload.sdp);
        });

        // Receiving incoming answer
        socket.on("answer", async (payload) => {
          if (activeConnection) {
            await activeConnection.handleAnswer(payload.sdp);
          }
        });

        // Receiving ICE candidates
        socket.on("ice-candidate", async (payload) => {
          if (activeConnection) {
            await activeConnection.handleIceCandidate(payload.candidate);
          }
        });

      } catch (err) {
        console.error("WebRTC room entry error", err);
        set({
          status: "error",
          error: "לא ניתן לגשת למיקרופון. אנא ודא שניתנו הרשאות מתאימות בדפדפן."
        });
      }
    },

    toggleMute: () => {
      if (localAudioStream) {
        const audioTrack = localAudioStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          set({ isMuted: !audioTrack.enabled });
        }
      }
    },

    leaveRoom: () => {
      if (activeConnection) {
        activeConnection.close();
        activeConnection = null;
      }
      if (localAudioStream) {
        localAudioStream.getTracks().forEach((track) => track.stop());
        localAudioStream = null;
      }
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      set({ roomId: null, status: "disconnected", remoteStream: null, isMuted: false });
    }
  }));
  ```

---

### Task 7: Build English Practice Arena UI (Hebrew UI)

**Files:**
- Create: [EnglishArena.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/arena/presentation/EnglishArena.jsx)

- [ ] **Step 1: Write `EnglishArena.jsx` view**
  Create the practice arena component with room selector, WebRTC audio stream playback, custom prompt cards deck, and full Hebrew controls:
  ```jsx
  import React, { useState, useEffect, useRef } from "react";
  import { useUserStore } from "../../user/data/userStore";
  import { useArenaStore } from "../data/arenaStore";
  import { ArrowRight, Mic, MicOff, PhoneOff, Users, ChevronLeft, ChevronRight } from "lucide-react";
  import { useNavigate } from "react-router-dom";

  const PROMPT_CARDS = [
    "What is your favorite animal and why?",
    "What did you do during the weekend?",
    "Tell me about your favorite school subject!",
    "If you could have any superpower, what would it be?",
    "What is your favorite food and how do you make it?",
    "What is your favorite game to play with friends?"
  ];

  export default function EnglishArena() {
    const { user } = useUserStore();
    const { roomId, status, error, remoteStream, isMuted, joinRoom, toggleMute, leaveRoom } = useArenaStore();
    const navigate = useNavigate();

    const [customRoomId, setCustomRoomId] = useState("");
    const [cardIndex, setCardIndex] = useState(0);
    const audioRef = useRef(null);

    // Bind remote audio stream to audio element
    useEffect(() => {
      if (audioRef.current && remoteStream) {
        audioRef.current.srcObject = remoteStream;
      }
    }, [remoteStream]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        leaveRoom();
      };
    }, [leaveRoom]);

    const handleJoinGeneral = () => {
      if (user?._id) {
        joinRoom("arena-room-1", user._id);
      }
    };

    const handleJoinCustom = (e) => {
      e.preventDefault();
      if (customRoomId.trim() && user?._id) {
        joinRoom(customRoomId.trim(), user._id);
      }
    };

    const nextCard = () => {
      setCardIndex((prev) => (prev + 1) % PROMPT_CARDS.length);
    };

    const prevCard = () => {
      setCardIndex((prev) => (prev - 1 + PROMPT_CARDS.length) % PROMPT_CARDS.length);
    };

    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center" dir="rtl">
        {remoteStream && <audio ref={audioRef} autoPlay />}

        <div className="w-full max-w-4xl flex justify-between items-center mb-10">
          <button
            onClick={() => { leaveRoom(); navigate("/child"); }}
            className="flex items-center text-slate-600 hover:text-indigo-600 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group"
          >
            <ArrowRight className="h-5 w-5 ml-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">חזור ללוח הראשי</span>
          </button>
          <h1 className="text-4xl font-black text-slate-900">זירת אימון באנגלית</h1>
        </div>

        {error && (
          <div className="w-full max-w-4xl p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-center font-bold mb-6">
            {error}
          </div>
        )}

        {status === "disconnected" ? (
          /* Room Selector UI */
          <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center text-center gap-8">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 shadow-inner">
              <Users className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800">בחרו חדר שיחה</h2>
              <p className="text-slate-500 text-md mt-2">הצטרפו לחדר שיחה כללי או התחברו עם חבר בחדר פרטי בעזרת קוד.</p>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-6 mt-4">
              <button
                onClick={handleJoinGeneral}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all text-xl cursor-pointer"
              >
                הצטרף לחדר כללי
              </button>

              <form onSubmit={handleJoinCustom} className="flex-1 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="הכנס קוד חדר פרטי"
                  value={customRoomId}
                  onChange={(e) => setCustomRoomId(e.target.value)}
                  className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-800 text-center text-lg"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-white border-2 border-indigo-200 hover:bg-indigo-50 text-indigo-600 font-bold rounded-2xl transition-all text-lg cursor-pointer"
                >
                  כנס לחדר פרטי
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Active Voice Call Room UI */
          <div className="w-full max-w-3xl flex flex-col gap-8">
            {/* Status card */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">חדר פעיל: {roomId}</span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {status === "connecting" && "מתחבר..."}
                  {status === "waiting" && "ממתין לשותף שיצטרף... 👤"}
                  {status === "negotiating" && "יוצר חיבור קול... 🎙️"}
                  {status === "connected" && "מחובר לשיחה! 🎉"}
                </h3>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-full shadow-md transition-all ${isMuted ? "bg-rose-500 text-white animate-pulse" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  title={isMuted ? "בטל השתקה" : "השתק מיקרופון"}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <button
                  onClick={leaveRoom}
                  className="p-4 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-all"
                  title="נתק שיחה"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Conversation Prompt Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[2.5rem] p-10 shadow-lg flex flex-col items-center text-center justify-between min-h-[300px]">
              <span className="text-indigo-200 font-bold tracking-wider text-sm uppercase">קלף נושא לשיחה 📑</span>
              <div className="my-6">
                <h4 className="text-3xl font-serif italic" dir="ltr">
                  "{PROMPT_CARDS[cardIndex]}"
                </h4>
              </div>
              <div className="flex justify-between items-center w-full max-w-xs mt-4">
                <button
                  onClick={prevCard}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <span className="text-sm font-semibold text-indigo-100">
                  {cardIndex + 1} מתוך {PROMPT_CARDS.length}
                </span>
                <button
                  onClick={nextCard}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  ```

---

### Task 8: Strict UI Hebrew Auditing

- [ ] **Step 1: Check components for English strings**
  Verify all files under `EX2/packages/frontend/src/features` (including the login, dashboard, and game modules) for non-learning text strings in English and translate them to Hebrew.
  Ensure alerts, headers, inputs placeholers, and button text conform to the strict Hebrew UI guideline.

---

## Verification Plan

### Automated Tests
*None (No frontend test runner is configured). We will use build verification and manual testing.*

### Manual Verification
1. Run `npm run dev` in the root monorepo directory to launch the API gateway, all backends, and the frontend dev server.
2. Sign in to the child dashboard as a child account.
3. Open the "Grammar Hero" profile view and click the simulation buttons to verify that points increase and trigger level/milestone WebSocket popups.
4. Open a second browser session/tab in incognito mode, log in as a separate child account, and enter the same room in the "English Practice Arena". Verify WebRTC audio streams and card prompt selectors work.
5. Inspect the entire UI for any English remnants.
