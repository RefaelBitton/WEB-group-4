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
  { id: "PLAYED_10_MINS", title: "מתאמן מתמיד", desc: "תרגלת אנגלית במשך 10 דקות לפחות" },
  { id: "ARENA_CHALLENGER", title: "לוחם זירת השיחה", desc: "הצטרפת לזירת האימון לדיבור חופשי" },
  { id: "CHAT_MASTER", title: "אלוף השיח", desc: "כתבת בהצלחה 5 משפטים נכונים בצ'אט" },
  { id: "VOCABULARY_EXPLORER", title: "חוקר אוצר המילים", desc: "סיימת בהצלחה 3 משחקים לימודיים" },
  { id: "POINT_CENTURY", title: "מאה ראשונה!", desc: "צברת 100 נקודות והפכת ללומד בינוני" },
  { id: "HALF_MILLENNIUM", title: "חצי דרך לפסגה!", desc: "צברת 500 נקודות והפכת ללומד מתקדם" }
];

export default function GrammarHeroProfile() {
  const { user } = useUserStore();
  const { 
    points, 
    rank, 
    achievements, 
    purchasedItems,
    activeTheme,
    activeTrinkets,
    leaderboard,
    storeItems,
    progressionData,
    loading, 
    error, 
    loadStats, 
    triggerAward, 
    milestonePopup, 
    clearMilestonePopup,
    loadLeaderboard,
    loadStoreItems,
    buyItem,
    equipItem,
    loadProgressionData
  } = useGamificationStore();
  
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = React.useState("profile");

  // Only show the developer simulator if ?debug=true query parameter is present
  const showDebugPanel = location.search.includes("debug=true") || user?.role === "parent";

  useEffect(() => {
    if (user?._id) {
      loadStats(user._id);
      loadProgressionData(user._id);
    }
  }, [user, loadStats, loadProgressionData]);

  useEffect(() => {
    if (activeTab === "leaderboard") {
      loadLeaderboard();
    } else if (activeTab === "store") {
      loadStoreItems();
    }
  }, [activeTab, loadLeaderboard, loadStoreItems]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 pb-24 md:pb-12 flex flex-col items-center transition-colors duration-300" dir="rtl">
      <MilestoneToast popup={milestonePopup} onClose={clearMilestonePopup} />

      <div className="w-full max-w-4xl flex flex-col-reverse sm:flex-row justify-between items-center gap-6 mb-10">
        <button
          onClick={() => navigate("/child")}
          className="flex items-center text-slate-600 dark:text-slate-350 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group cursor-pointer font-bold"
        >
          <ArrowRight className="h-5 w-5 ml-2 group-hover:-translate-x-1 transition-transform" />
          <span>חזור ללוח הראשי</span>
        </button>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">מרכז ההישגים והפרסים</h1>
      </div>

      {error && (
        <div className="w-full max-w-4xl p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl text-center font-bold mb-6 animate-pulse">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="w-full max-w-4xl flex border-b border-slate-200 dark:border-slate-800 mb-8 justify-center gap-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-4 px-6 text-lg font-bold transition-all border-b-4 cursor-pointer ${
            activeTab === "profile"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          פרופיל והישגים
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`pb-4 px-6 text-lg font-bold transition-all border-b-4 cursor-pointer ${
            activeTab === "leaderboard"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          טבלת מובילים 🏆
        </button>
        <button
          onClick={() => setActiveTab("store")}
          className={`pb-4 px-6 text-lg font-bold transition-all border-b-4 cursor-pointer ${
            activeTab === "store"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          חנות פרסים 🛍️
        </button>
      </div>

      {/* Profile & Achievements Tab */}
      {activeTab === "profile" && (
        <div className="w-full max-w-4xl grid gap-8 grid-cols-1 md:grid-cols-2">
          {/* Card 1: Score & Rank */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center text-center justify-between col-span-1 transition-colors duration-300">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/20 rounded-full flex items-center justify-center text-amber-500 dark:text-amber-400 mb-4 shadow-inner">
              <Trophy className="w-10 h-10" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">דרגה נוכחית</span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {RANK_MAP[rank] || rank}
                {activeTrinkets.includes("golden-crown") && <span className="mr-2">👑</span>}
              </h2>
            </div>
            <div className="mt-6">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-indigo-600">
                {points}
              </span>
              <span className="text-slate-400 dark:text-slate-500 font-bold text-lg mr-2">נקודות</span>
            </div>
          </div>

          {/* Card 2: Academic English Level */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center text-center justify-between col-span-1 transition-colors duration-300">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/20 rounded-full flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-4 shadow-inner">
              <GraduationCap className="w-10 h-10" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">רמת אנגלית אקדמית</span>
              <h2 className="text-3xl font-extrabold text-indigo-800 dark:text-indigo-400 mt-1">
                {LEVEL_MAP[user?.englishLevel] || LEVEL_MAP["beginner"]}
              </h2>
            </div>
            <div className="mt-6">
              <span className="text-slate-500 dark:text-slate-400 font-bold text-md">
                רמת לימוד מותאמת אישית
              </span>
            </div>
          </div>

          {/* Card 3: Level Progression Meter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm md:col-span-2 flex flex-col justify-between transition-colors duration-300">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="text-indigo-500 dark:text-indigo-400" />
              מד התקדמות הדרגה
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between text-base sm:text-lg font-semibold text-slate-600 dark:text-slate-350 gap-2">
                <span>הרמה הבאה: <strong className="text-indigo-600 dark:text-indigo-400">{nextRankName()}</strong></span>
                <span>{getPointsToNextRank() > 0 ? `עוד ${getPointsToNextRank()} נקודות` : "הגעת לפסגה!"}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-full overflow-hidden shadow-inner p-1">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 shadow-md"
                  style={{ width: `${getProgressPercent()}%` }}
                ></div>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-md mt-4 font-medium">המשך לפתור שאלות ולדבר עם הבוט כדי לזכות בנקודות ולטפס בדרגות!</p>
          </div>

          {/* Card 4: Progression Graphs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm md:col-span-2 transition-colors duration-300">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="text-indigo-500" />
              מדדי הלמידה וההתקדמות שלי
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Success Rings & Time Spent Breakdown */}
              <div className="flex flex-col gap-6">
                <h4 className="text-lg font-bold text-slate-700 dark:text-slate-350">סיכום הצלחה וזמן תרגול</h4>
                
                {/* Concentric progress rings */}
                <div className="flex justify-around items-center gap-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900/30 rounded-3xl p-6">
                  {/* Games success ring */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8"></circle>
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#10b981" strokeWidth="8" 
                          strokeDasharray="213.6" 
                          strokeDashoffset={213.6 - (213.6 * (progressionData?.successRates?.game || 0)) / 100} 
                          strokeLinecap="round" 
                          transform="rotate(-90 40 40)"
                          className="transition-all duration-1000 animate-pulse"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 text-lg">
                        {progressionData?.successRates?.game || 0}%
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-2">הצלחה במשחקים</span>
                  </div>

                  {/* Chat success ring */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8"></circle>
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#6366f1" strokeWidth="8" 
                          strokeDasharray="213.6" 
                          strokeDashoffset={213.6 - (213.6 * (progressionData?.successRates?.chat || 0)) / 100} 
                          strokeLinecap="round" 
                          transform="rotate(-90 40 40)"
                          className="transition-all duration-1000 animate-pulse"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-lg">
                        {progressionData?.successRates?.chat || 0}%
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-2">הצלחה בצ'אט</span>
                  </div>
                </div>

                {/* Time spent bar breakdown */}
                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900/30 rounded-3xl p-6 flex flex-col justify-center">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                    <span>חלוקת זמן תרגול</span>
                    <span>סה"כ: {progressionData?.timeSpent?.total || 0} דקות</span>
                  </div>
                  {/* Progress bar stack */}
                  <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    {(() => {
                      const chatMins = progressionData?.timeSpent?.breakdown?.chat || 0;
                      const gameMins = progressionData?.timeSpent?.breakdown?.game || 0;
                      const arenaMins = progressionData?.timeSpent?.breakdown?.arena || 0;
                      const total = chatMins + gameMins + arenaMins || 1;

                      const chatPct = (chatMins / total) * 100;
                      const gamePct = (gameMins / total) * 100;
                      const arenaPct = (arenaMins / total) * 100;

                      return (
                        <>
                          <div style={{ width: `${gamePct}%` }} className="bg-indigo-500 h-full animate-pulse" title="משחקים"></div>
                          <div style={{ width: `${chatPct}%` }} className="bg-emerald-500 h-full animate-pulse" title="צ'אט"></div>
                          <div style={{ width: `${arenaPct}%` }} className="bg-amber-500 h-full animate-pulse" title="זירה"></div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex gap-4 justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-3">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>משחקים</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>צ'אט</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>זירה</span>
                  </div>
                </div>
              </div>

              {/* Weekly points growth graph */}
              <div className="flex flex-col gap-6">
                <h4 className="text-lg font-bold text-slate-700 dark:text-slate-350">קצב צבירת הנקודות שלך</h4>
                
                {/* SVG Line Chart */}
                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900/30 rounded-3xl p-6 flex flex-col justify-between items-stretch h-full min-h-[220px]">
                  {(() => {
                    const days = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
                    const recentActivities = progressionData?.recentActivities || [];
                    const dailyScores = Array(7).fill(0);
                    const now = new Date();
                    
                    recentActivities.forEach(act => {
                      const actDate = new Date(act.timestamp);
                      const diffDays = Math.floor((now - actDate) / (1000 * 60 * 60 * 24));
                      if (diffDays >= 0 && diffDays < 7) {
                        dailyScores[6 - diffDays] += act.score || 0;
                      }
                    });

                    let currentAccum = points - dailyScores.reduce((a, b) => a + b, 0);
                    if (currentAccum < 0) currentAccum = 0;

                    const cumulativeData = dailyScores.map(score => {
                      currentAccum += score;
                      return currentAccum;
                    });

                    const maxVal = Math.max(...cumulativeData, 100);
                    
                    const pointsCoords = cumulativeData.map((val, idx) => {
                      const x = 20 + idx * 42;
                      const y = 90 - (val / maxVal) * 80;
                      return { x, y, val };
                    });

                    const pathD = pointsCoords.reduce((acc, coord, idx) => {
                      return acc + `${idx === 0 ? "M" : "L"} ${coord.x} ${coord.y} `;
                    }, "");

                    return (
                      <>
                        <div className="relative w-full h-[140px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 flex flex-col justify-end">
                          <div className="absolute left-2 top-2 bottom-6 flex flex-col justify-between text-[8px] font-black text-slate-400 select-none">
                            <span>{Math.round(maxVal)}</span>
                            <span>{Math.round(maxVal / 2)}</span>
                            <span>0</span>
                          </div>

                          <svg width="100%" height="100px" viewBox="0 0 300 100" preserveAspectRatio="none" className="ml-5">
                            <line x1="0" y1="10" x2="300" y2="10" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3"></line>
                            <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3"></line>
                            <line x1="0" y1="90" x2="300" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3"></line>
                            
                            {pathD && (
                              <>
                                <path 
                                  d={pathD} 
                                  fill="none" 
                                  stroke="url(#graph-gradient)" 
                                  strokeWidth="4" 
                                  strokeLinecap="round"
                                  className="transition-all duration-1000"
                                ></path>
                                
                                {pointsCoords.map((coord, idx) => (
                                  <g key={idx}>
                                    <circle 
                                      cx={coord.x} 
                                      cy={coord.y} 
                                      r="4.5" 
                                      fill="#6366f1" 
                                      stroke="#ffffff" 
                                      strokeWidth="1.5"
                                    ></circle>
                                  </g>
                                ))}
                              </>
                            )}

                            <defs>
                              <linearGradient id="graph-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1"></stop>
                                <stop offset="100%" stopColor="#d946ef"></stop>
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        
                        <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 mt-2 px-1 ml-5 select-none" dir="ltr">
                          {days.map((day, idx) => (
                            <span key={idx} className="w-8 text-center">{day}</span>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

            </div>
          </div>

          {/* Card 5: Achievements list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm md:col-span-2 transition-colors duration-300">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
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
                        ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-slate-800 dark:text-slate-100"
                        : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-60 grayscale"
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm ${isUnlocked ? "bg-amber-100 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400" : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500"}`}>
                      <Award className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-extrabold">{badge.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{badge.desc}</p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full mt-4 ${isUnlocked ? "bg-amber-200 dark:bg-amber-950 text-amber-800 dark:text-amber-300" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                      {isUnlocked ? "הושלם" : "נעול"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm transition-all duration-300">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            🏆 היכל התהילה של גיבורי הדקדוק
          </h3>
          <div className="flex flex-col gap-4">
            {leaderboard.length === 0 ? (
              <div className="text-center p-8 text-slate-500">טוען טבלת מובילים...</div>
            ) : (
              leaderboard.map((player, index) => {
                const isSelf = player.userId === user?._id;
                const hasCrown = player.activeTrinkets?.includes("golden-crown");
                
                let rankStyle = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350";
                if (index === 0) rankStyle = "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300";
                if (index === 1) rankStyle = "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300";
                if (index === 2) rankStyle = "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-300";

                return (
                  <div 
                    key={player.userId || index} 
                    className={`flex items-center justify-between p-4 rounded-3xl border transition-all duration-300 ${
                      isSelf 
                        ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 shadow-md scale-[1.01]" 
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${rankStyle}`}>
                        {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">
                          {player.name} {isSelf && "(את/ה)"}
                        </span>
                        {hasCrown && <span className="text-xl">👑</span>}
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full">
                          {RANK_MAP[player.rank] || player.rank}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-xl">
                      {player.points} נק'
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Prize Store Tab */}
      {activeTab === "store" && (
        <div className="w-full max-w-4xl flex flex-col gap-8 animate-fade-in">
          {/* Points Balance Banner */}
          <div className="bg-gradient-to-r from-amber-400 to-indigo-600 text-white rounded-[2rem] p-6 text-center shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-right">
              <h3 className="text-2xl font-black">חנות הפרסים של גיבורי הדקדוק 🛍️</h3>
              <p className="opacity-90 text-sm mt-1">רכשו ערכות עיצוב יפות וקישוטי מסך אינטראקטיביים עם הנקודות שצברתם!</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl flex items-center gap-2">
              <span className="text-sm font-semibold">המאזן שלך:</span>
              <span className="text-3xl font-black">{points}</span>
              <span className="text-lg">🪙</span>
            </div>
          </div>

          {/* Themes Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              🎨 ערכות עיצוב לממשק (Themes)
            </h4>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {/* Default Theme Card */}
              <div className="border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex flex-col justify-between items-center text-center bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <h5 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">ערכת ברירת מחדל</h5>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">העיצוב המקורי והנקי של האפליקציה.</p>
                </div>
                <button
                  onClick={() => equipItem(user?._id, "default", "theme")}
                  className={`mt-6 px-6 py-2.5 rounded-full font-bold transition-all cursor-pointer ${
                    activeTheme === "default" || !activeTheme
                      ? "bg-emerald-500 text-white cursor-default"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                  disabled={activeTheme === "default" || !activeTheme}
                >
                  {activeTheme === "default" || !activeTheme ? "פעיל ✓" : "הפעל עיצוב"}
                </button>
              </div>

              {/* API Themes */}
              {storeItems.filter(i => i.category === "theme").map(item => {
                const isPurchased = purchasedItems.includes(item.id);
                const isActive = activeTheme === item.id;
                
                return (
                  <div key={item.id} className="border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex flex-col justify-between items-center text-center hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-800/30">
                    <div>
                      <h5 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">{item.name}</h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{item.description}</p>
                    </div>
                    <div className="w-full mt-6">
                      {isPurchased ? (
                        <button
                          onClick={() => equipItem(user?._id, item.id, "theme")}
                          className={`w-full py-2.5 rounded-full font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-emerald-500 text-white cursor-default"
                              : "bg-indigo-50 dark:bg-indigo-950 text-indigo-655 dark:text-indigo-400 hover:bg-indigo-100"
                          }`}
                          disabled={isActive}
                        >
                          {isActive ? "פעיל ✓" : "הפעל עיצוב"}
                        </button>
                      ) : (
                        <button
                          onClick={() => buyItem(user?._id, item.id)}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>רכישה ב-{item.cost} נק'</span>
                          <span>🪙</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trinkets Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              ✨ קישוטי מסך ואינטראקציות (Trinkets)
            </h4>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
              {storeItems.filter(i => i.category === "trinket").map(item => {
                const isPurchased = purchasedItems.includes(item.id);
                const isActive = activeTrinkets.includes(item.id);
                
                return (
                  <div key={item.id} className="border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex flex-col justify-between items-center text-center hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-3 select-none">
                        {item.id === "pet-dragon" ? "🐉" : item.id === "friendly-ghost" ? "👻" : item.id === "sparkle-trail" ? "✨" : item.id === "golden-crown" ? "👑" : "❄️"}
                      </span>
                      <h5 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">{item.name}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{item.description}</p>
                    </div>
                    <div className="w-full mt-6">
                      {isPurchased ? (
                        <button
                          onClick={() => equipItem(user?._id, item.id, "trinket")}
                          className={`w-full py-2.5 rounded-full font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-emerald-500 text-white hover:bg-emerald-600"
                              : "bg-slate-105 dark:bg-slate-800 text-slate-705 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          {isActive ? "פעיל (כבה)" : "הפעל קישוט"}
                        </button>
                      ) : (
                        <button
                          onClick={() => buyItem(user?._id, item.id)}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer text-sm"
                        >
                          <span>רכישה ב-{item.cost} נק'</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Simulator Panel (Only visible in debug mode or for parents) */}
      {showDebugPanel && activeTab === "profile" && (
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-inner md:col-span-2 mt-8 animate-fade-in w-full max-w-4xl transition-colors duration-300">
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-350 mb-4 flex items-center gap-2">
            <Play className="text-slate-500" />
            לוח בקרה למאמן (הדמיית צבירת הישגים - למפתחים)
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">השתמש בלחצנים הבאים כדי לסמל אירועים המעניקים נקודות ולבדוק את חיבור ה-WebSocket בזמן אמת.</p>
          <div className="flex flex-wrap gap-4 font-bold">
            <button
              disabled={loading}
              onClick={() => user?._id && triggerAward(user._id, "correct_sentence")}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer animate-fade-in"
            >
              משפט נכון (+10 נקודות)
            </button>
            <button
              disabled={loading}
              onClick={() => user?._id && triggerAward(user._id, "game_completed")}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer animate-fade-in"
            >
              השלמת משחק (+30 נקודות)
            </button>
            <button
              disabled={loading}
              onClick={() => user?._id && triggerAward(user._id, "play_10_mins")}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer animate-fade-in"
            >
              תרגול 10 דקות (+50 נקודות)
            </button>
            <button
              disabled={loading}
              onClick={() => user?._id && triggerAward(user._id, "join_arena")}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer animate-fade-in"
            >
              כניסה לזירה (+15 נקודות)
            </button>
            <button
              disabled={loading}
              onClick={() => user?._id && triggerAward(user._id, "chat_streak_5")}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer animate-fade-in"
            >
              5 משפטים נכונים (+25 נקודות)
            </button>
            <button
              disabled={loading}
              onClick={() => user?._id && triggerAward(user._id, "three_games_completed")}
              className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-slate-755 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer animate-fade-in"
            >
              סיום 3 משחקים (+40 נקודות)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
