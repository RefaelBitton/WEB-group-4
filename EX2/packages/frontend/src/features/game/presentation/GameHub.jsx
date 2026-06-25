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
    questionsPlayedCount,
    sessionScore,
    selectedOptionId,
    correctOptionId,
    isAnswering,
    showPointsToast,
    correctAnswersCount,
    wrongAnswersCount,
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
            <p className="text-xl text-slate-500 mb-6 max-w-md leading-relaxed">
              סיימת <strong>10</strong> שאלות ב<strong>{selectedGame.name}</strong> וצברת <strong>{sessionScore}</strong> נקודות! 🏆
            </p>
            <div className="flex gap-8 mb-8 justify-center bg-slate-50 border border-slate-200/60 p-6 rounded-3xl w-full max-w-sm">
              <div className="flex flex-col items-center">
                <span className="text-emerald-600 font-bold text-lg flex items-center gap-1">
                  תשובות נכונות ✓
                </span>
                <span className="text-3xl font-black text-emerald-600 mt-1">{correctAnswersCount}</span>
              </div>
              <div className="w-[1.5px] bg-slate-200 self-stretch"></div>
              <div className="flex flex-col items-center">
                <span className="text-rose-500 font-bold text-lg flex items-center gap-1">
                  תשובות שגויות ✗
                </span>
                <span className="text-3xl font-black text-rose-500 mt-1">{wrongAnswersCount}</span>
              </div>
            </div>
            <p className="text-lg text-indigo-600 font-bold mb-8">
              הרווחת 30 נקודות בונוס לדרגת גיבור הדקדוק שלך! 🏆
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
    } else {
      const progressPercent = Math.min(100, (questionsPlayedCount / 10) * 100);

      const gameHeader = (
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 mb-8 shadow-sm flex items-center justify-between gap-4">
          {/* Left Side: Game details & Progress */}
          <div className="flex flex-col gap-2 flex-grow">
            <div className="flex justify-between text-lg font-bold text-slate-700">
              <span>{selectedGame.name}</span>
              <span>שאלה {Math.min(10, questionsPlayedCount + 1)} מתוך 10</span>
            </div>
            {/* Progress Bar Container */}
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200/50">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Right Side: Score indicator */}
          <div className="relative flex flex-col items-center justify-center bg-amber-50 border border-amber-200 px-6 py-3.5 rounded-2xl min-w-32 shadow-sm">
            {showPointsToast && (
              <span className="absolute -top-6 text-xl font-extrabold text-amber-500 animate-float-up" dir="ltr">
                +10
              </span>
            )}
            <span className="text-xs font-semibold text-amber-600/80">ניקוד נוכחי</span>
            <span className="text-2xl font-black text-amber-600 flex items-center gap-1.5 mt-0.5 animate-pulse-gold">
              {sessionScore} <Trophy className="w-5.5 h-5.5 text-amber-500 inline fill-amber-400" />
            </span>
          </div>
        </div>
      );

      if (selectedGame.id === "image-recognition") {
        content = (
          <div className="w-full">
            {gameHeader}
            <ImageRecognition 
              questionData={currentQuestion} 
              loading={loading || isAnswering} 
              onAnswerSubmit={(ansId) => answerGame(selectedGame.id, { answerId: ansId })} 
              onBack={() => selectGame(null)} 
              selectedOptionId={selectedOptionId}
              correctOptionId={correctOptionId}
              isAnswering={isAnswering}
            />
          </div>
        );
      } else if (selectedGame.id === "sentence-completion") {
        content = (
          <div className="w-full">
            {gameHeader}
            <SentenceCompletion 
              questionData={currentQuestion} 
              loading={loading || isAnswering} 
              onAnswerSubmit={(ansId) => answerGame(selectedGame.id, { answerId: ansId })} 
              onBack={() => selectGame(null)} 
              selectedOptionId={selectedOptionId}
              correctOptionId={correctOptionId}
              isAnswering={isAnswering}
            />
          </div>
        );
      } else if (selectedGame.id === "quick-translation") {
        content = (
          <div className="w-full">
            {gameHeader}
            <QuickTranslation 
              questionData={currentQuestion} 
              loading={loading || isAnswering} 
              onAnswerSubmit={(ansId) => answerGame(selectedGame.id, { answerId: ansId })} 
              onBack={() => selectGame(null)} 
              selectedOptionId={selectedOptionId}
              correctOptionId={correctOptionId}
              isAnswering={isAnswering}
            />
          </div>
        );
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
