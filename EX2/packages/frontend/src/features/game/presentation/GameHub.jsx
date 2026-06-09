import React from "react";
import { useGame } from "../data/gameState.js";
import { ImageRecognition } from "./ImageRecognition.jsx";
import { SentenceCompletion } from "./SentenceCompletion.jsx";
import { QuickTranslation } from "./QuickTranslation.jsx";

export function GameHub() {
  const { games, loading, error, selectGame, selectedGame, currentQuestion, answerGame } = useGame();

  let content;

  if (selectedGame) {
    if (selectedGame.id === "image-recognition") {
      content = <ImageRecognition questionData={currentQuestion} onAnswerSubmit={(ansId) => answerGame(selectedGame.id, { answerId: ansId })} onBack={() => selectGame(null)} />;
    } else if (selectedGame.id === "sentence-completion") {
      content = <SentenceCompletion questionData={currentQuestion} onAnswerSubmit={(ansId) => answerGame(selectedGame.id, { answerId: ansId })} onBack={() => selectGame(null)} />;
    } else if (selectedGame.id === "quick-translation") {
      content = <QuickTranslation questionData={currentQuestion} onAnswerSubmit={(ansId) => answerGame(selectedGame.id, { answerId: ansId })} onBack={() => selectGame(null)} />;
    } else {
      content = (
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-12 shadow-sm text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">{selectedGame.name}</h2>
          <p className="text-xl text-slate-500 mb-8">המשחק עדיין בפיתוח.</p>
          <button onClick={() => selectGame(null)} className="px-6 py-3 bg-slate-100 rounded-xl text-slate-700 hover:bg-slate-200 font-medium transition-colors">
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
        <h2 className="text-5xl font-extrabold text-slate-900 mb-6 text-center tracking-tight">מרכז המשחקים</h2>
        <p className="text-2xl text-slate-500 mb-12 text-center">בחרו משחק לימוד כדי לתרגל אנגלית בצורה משחקית ומהנה.</p>

        {loading && <p className="text-xl text-slate-500 mb-4 text-center">טוען משחקים...</p>}
        {error && <p className="text-xl text-rose-600 mb-4 text-center">{error}</p>}

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
