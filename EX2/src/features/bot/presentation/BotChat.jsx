export function BotChat() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-right">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">צ'אט עם הבוט</h2>
      <p className="text-slate-500 mb-6">כאן נציג את השאלות באנגלית ואת התיקונים בעברית.</p>
      <div className="space-y-4">
        <textarea
          className="w-full min-h-[150px] rounded-2xl border border-slate-300 px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="הקלד הודעה באנגלית או הקש על מיקרופון"
        />
        <button className="w-full rounded-2xl bg-indigo-500 px-4 py-3 text-white font-medium hover:bg-indigo-600">
          שלח לבוט
        </button>
      </div>
    </section>
  );
}
