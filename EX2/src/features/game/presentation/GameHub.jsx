import React from "react";
import { useGame } from "../data/gameState.js";

export function GameHub() {
  const { games, loading, error, selectGame } = useGame();

  const availableGames = games.length
    ? games
    : [
        { id: "image-recognition", name: "משחק זיהוי תמונות" },
        { id: "sentence-completion", name: "השלמת משפטים" },
        { id: "quick-translation", name: "תרגום מהיר" },
      ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-right">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">מרכז המשחקים</h2>
      <p className="text-slate-500 mb-6">בחרו משחק לימוד כדי לתרגל אנגלית בצורה משחקית.</p>

      {loading && <p className="text-slate-500 mb-4">טוען משחקים...</p>}
      {error && <p className="text-sm text-rose-600 mb-4">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {availableGames.map((game) => (
          <button
            key={game.id}
            onClick={() => selectGame(game.id)}
            className="rounded-3xl border border-slate-300 bg-slate-50 px-5 py-4 text-right font-medium hover:border-slate-400"
          >
            {game.name}
          </button>
        ))}
      </div>
    </section>
  );
}
