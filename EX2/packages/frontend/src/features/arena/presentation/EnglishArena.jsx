import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "../../user/data/userStore";
import { useArenaStore } from "../data/arenaStore";
import { ArrowRight, Mic, MicOff, PhoneOff, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGamificationStore } from "../../gamification/data/gamificationStore";

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
      useGamificationStore.getState().triggerAward(user._id, "join_arena");
    }
  };

  const handleJoinCustom = (e) => {
    e.preventDefault();
    if (customRoomId.trim() && user?._id) {
      joinRoom(customRoomId.trim(), user._id);
      useGamificationStore.getState().triggerAward(user._id, "join_arena");
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
          className="flex items-center text-slate-600 hover:text-indigo-600 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group cursor-pointer"
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
        <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center text-center gap-8 animate-fade-in">
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
        <div className="w-full max-w-3xl flex flex-col gap-8 animate-fade-in">
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
                className={`p-4 rounded-full shadow-md transition-all cursor-pointer ${isMuted ? "bg-rose-500 text-white animate-pulse" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                title={isMuted ? "בטל השתקה" : "השתק מיקרופון"}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button
                onClick={leaveRoom}
                className="p-4 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-all cursor-pointer"
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
              <h4 className="text-3xl font-serif italic leading-relaxed" dir="ltr">
                "{PROMPT_CARDS[cardIndex]}"
              </h4>
            </div>
            <div className="flex justify-between items-center w-full max-w-xs mt-4">
              <button
                onClick={prevCard}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all text-white cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <span className="text-sm font-semibold text-indigo-100">
                {cardIndex + 1} מתוך {PROMPT_CARDS.length}
              </span>
              <button
                onClick={nextCard}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all text-white cursor-pointer"
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
