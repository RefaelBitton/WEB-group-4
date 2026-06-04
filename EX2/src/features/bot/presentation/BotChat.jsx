import React from "react";
import { useBot } from "../data/botState.js";

export function BotChat() {
  const { messages, input, setInput, sendMessage, starter, loading, error } = useBot();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-right">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">צ'אט עם הבוט</h2>
      <p className="text-slate-500 mb-4">{starter}</p>

      <div className="space-y-4">
        {messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`rounded-2xl p-4 ${
                  message.role === "user" ? "bg-indigo-50 text-right" : "bg-slate-100 text-right"
                }`}
              >
                <p className="text-xs text-slate-500">
                  {message.role === "user" ? "את/ה כתבת" : "הבוט השיב"}
                </p>
                <p className="mt-1 text-slate-900">{message.text}</p>
              </div>
            ))}
          </div>
        )}

        <textarea
          className="w-full min-h-[150px] rounded-2xl border border-slate-300 px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="הקלד הודעה באנגלית או הקש על מיקרופון"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          onClick={sendMessage}
          disabled={loading}
          className="w-full rounded-2xl bg-indigo-500 px-4 py-3 text-white font-medium hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "שולח..." : "שלח לבוט"}
        </button>
      </div>
    </section>
  );
}
