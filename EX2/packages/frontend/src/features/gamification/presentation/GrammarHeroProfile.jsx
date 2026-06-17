import React, { useEffect } from "react";
import { useUserStore } from "../../user/data/userStore";
import { useGamificationStore } from "../data/gamificationStore";
import { ArrowRight, Trophy, Award, Activity, Play, GraduationCap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import MilestoneToast from "./MilestoneToast";

const RANK_MAP = {
  Beginner: "טירון אנגלית",
  "Intermediate Learner": "לומד בינוני",
  "Advanced Learner": "לומד מתקדם",
  "Grammar Hero": "גיבור דקדוק 🏆",
};

const LEVEL_MAP = {
  beginner: "מתחיל 🌟",
  basic: "בסיסי 🚀",
  intermediate: "בינוני 🎓",
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
  const location = useLocation();

  // Only show the developer simulator if ?debug=true query parameter is present
  const showDebugPanel = location.search.includes("debug=true") || user?.role === "parent";

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
          className="flex items-center text-slate-600 hover:text-indigo-600 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group cursor-pointer font-bold"
        >
          <ArrowRight className="h-5 w-5 ml-2 group-hover:-translate-x-1 transition-transform" />
          <span>חזור ללוח הראשי</span>
        </button>
        <h1 className="text-4xl font-black text-slate-900">פרופיל גיבור הדקדוק</h1>
      </div>

      {error && (
        <div className="w-full max-w-4xl p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-center font-bold mb-6 animate-pulse">
          {error}
        </div>
      )}

      <div className="w-full max-w-4xl grid gap-8 grid-cols-1 md:grid-cols-2">
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

        {/* Card 2: Academic English Level */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center text-center justify-between col-span-1">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-4 shadow-inner">
            <GraduationCap className="w-10 h-10" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">רמת אנגלית אקדמית</span>
            <h2 className="text-3xl font-extrabold text-indigo-800 mt-1">
              {LEVEL_MAP[user?.englishLevel] || LEVEL_MAP["beginner"]}
            </h2>
          </div>
          <div className="mt-6">
            <span className="text-slate-500 font-bold text-md">
              רמת לימוד מותאמת אישית
            </span>
          </div>
        </div>

        {/* Card 3: Level Progression Meter */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm md:col-span-2 flex flex-col justify-between">
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
          <p className="text-slate-500 text-md mt-4 font-medium">המשך לפתור שאלות ולדבר עם הבוט כדי לזכות בנקודות ולטפס בדרגות!</p>
        </div>

        {/* Card 4: Achievements list */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm md:col-span-2">
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

        {/* Simulator Panel (Only visible in debug mode or for parents) */}
        {showDebugPanel && (
          <div className="bg-slate-100 border border-slate-200 rounded-[2.5rem] p-8 shadow-inner md:col-span-2 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Play className="text-slate-500" />
              לוח בקרה למאמן (הדמיית צבירת הישגים - למפתחים)
            </h3>
            <p className="text-sm text-slate-500 mb-6">השתמש בלחצנים הבאים כדי לסמל אירועים המעניקים נקודות ולבדוק את חיבור ה-WebSocket בזמן אמת.</p>
            <div className="flex flex-wrap gap-4">
              <button
                disabled={loading}
                onClick={() => user?._id && triggerAward(user._id, "correct_sentence")}
                className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                משפט נכון (+10 נקודות)
              </button>
              <button
                disabled={loading}
                onClick={() => user?._id && triggerAward(user._id, "game_completed")}
                className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                השלמת משחק (+30 נקודות)
              </button>
              <button
                disabled={loading}
                onClick={() => user?._id && triggerAward(user._id, "play_10_mins")}
                className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                תרגול 10 דקות (+50 נקודות)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
