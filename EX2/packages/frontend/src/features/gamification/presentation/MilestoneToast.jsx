import React, { useEffect } from "react";
import { Trophy, Star, Sparkles } from "lucide-react";

const BADGE_MAP = {
  FIRST_CORRECT_SENTENCE: "המשפט הנכון הראשון שלי! ✍️",
  FIRST_GAME_COMPLETED: "אלוף המשחקים הראשון! 🎮",
  PLAYED_10_MINS: "10 דקות של אימון! ⏱️",
  ARENA_CHALLENGER: "לוחם זירת השיחה! 🎙️",
  CHAT_MASTER: "אלוף השיח! 💬",
  VOCABULARY_EXPLORER: "חוקר אוצר המילים! 🔍",
  POINT_CENTURY: "מאה ראשונה! 💯",
  HALF_MILLENNIUM: "חצי דרך לפסגה! 🚀",
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
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl shadow-md hover:from-amber-600 hover:to-yellow-600 transition-all text-lg cursor-pointer"
        >
          סגור
        </button>
      </div>
    </div>
  );
}
