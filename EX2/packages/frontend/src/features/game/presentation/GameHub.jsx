import React from "react";
import { useGame } from "../data/gameState.js";
import { ImageRecognition } from "./ImageRecognition.jsx";
import { SentenceCompletion } from "./SentenceCompletion.jsx";
import { QuickTranslation } from "./QuickTranslation.jsx";

import { ArrowRight, Trophy, Sparkles, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function GameHub() {
  const { 
    games, 
    loading, 
    error, 
    selectGame, 
    selectedGame, 
    currentQuestion, 
    answerGame, 
    gameFinished, 
    questionsPlayedCount 
  } = useGame();
  
  const navigate = useNavigate();

  let content;

  if (selectedGame) {
    if (gameFinished) {
      content = (
        <section className="relative overflow-hidden rounded-[2.5rem] border border-indigo-100 bg-white p-12 shadow-2xl text-center max-w-2xl mx-auto animate-fade-in">
          {/* Glowing gradients behind */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-200/40 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-indigo-200/40 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Pulsing circular container for Trophy */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-75"></div>
              <div className="relative w-32 h-32 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-300">
                <Trophy className="w-16 h-16 animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-2 shadow-md">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              כל הכבוד! סיימת את המשחק! 🎉
            </h2>
            <p className="text-xl text-slate-500 mb-8 max-w-md leading-relaxed">
              ענית בהצלחה על <strong>{questionsPlayedCount}</strong> שאלות ב<strong>{selectedGame.name}</strong>.
              הרווחת <strong>30 נקודות בונוס</strong> לדרגת גיבור הדקדוק שלך! 🏆
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => selectGame(selectedGame.id)} 
                className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-5 h-5" />
                <span>שחק שוב</span>
              </button>
              <button 
                onClick={() => selectGame(null)} 
                className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>חזור למרכז המשחקים</span>
              </button>
            </div>
          </div>
        </section>
      );
    } else if (selectedGame.id === "image-recognition") {
      content = <ImageRecognition questionData={currentQuestion} loading={loading} onAnswerSubmit={(ansId) => answerGame(selectedGame.id, { answerId: ansId })} onBack={() => selectGame(null)} />;
    } else if (selectedGame.id === "sentence-completion") {
      content = <SentenceCompletion questionData={currentQuestion} loading={loading} onAnswerSubmit={(ansId) => answerGame(selectedGame.id, { answerId: ansId })} onBack={() => selectGame(null)} />;
    } else if (selectedGame.id === "quick-translation") {
      content = <QuickTranslation questionData={currentQuestion} loading={loading} onAnswerSubmit={(ansId) => answerGame(selectedGame.id, { answerId: ansId })} onBack={() => selectGame(null)} />;
    } else {
      content = (
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-12 shadow-sm text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">{selectedGame.name}</h2>
          <p className="text-xl text-slate-500 mb-8">המשחק עדיין בפיתוח.</p>
          <button onClick={() => selectGame(null)} className="px-6 py-3 bg-slate-100 rounded-xl text-slate-700 hover:bg-slate-200 font-medium transition-colors cursor-pointer">
            חזור למרכז המשחקים
          </button>
        </section>
      );
    }
  } else {
    const availableGames = games.length
      ? games
      : [
          { id: "image-recognition", name: "משחק זיהוי תמונות" },
          { id: "sentence-completion", name: "השלמת משפטים" },
          { id: "quick-translation", name: "תרגום מהיר" },
        ];

    content = (
      <>
        <div className="flex justify-start mb-8 w-full">
          <button 
            onClick={() => navigate('/child')}
            className="flex items-center text-slate-600 hover:text-indigo-600 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group cursor-pointer"
          >
            <ArrowRight className="h-5 w-5 ml-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">חזור ללוח הראשי</span>
          </button>
        </div>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-6 text-center tracking-tight">מרכז המשחקים</h2>
        <p className="text-2xl text-slate-500 mb-12 text-center font-medium">בחרו משחק לימוד כדי לתרגל אנגלית בצורה משחקית ומהנה.</p>

        {loading && <p className="text-xl text-slate-500 mb-4 text-center">טוען משחקים...</p>}
        {error && <p className="text-xl text-rose-600 mb-4 text-center font-bold">{error}</p>}

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto">
          {availableGames.map((game) => (
            <button
              key={game.id}
              onClick={() => selectGame(game.id)}
              className="aspect-square flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-300 text-3xl font-bold text-slate-700 p-8 text-center group cursor-pointer"
            >
              <span className="transform group-hover:scale-110 transition-transform duration-300 leading-tight">
                {game.name}
              </span>
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center justify-center" dir="rtl">
      <div className="w-full max-w-5xl mx-auto">
        {content}
      </div>
    </div>
  );
}
