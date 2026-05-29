export function GameHub() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-right">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">מרכז המשחקים</h2>
      <p className="text-slate-500 mb-6">בחרו משחק לימוד כדי לתרגל אנגלית בצורה משחקית.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <button className="rounded-3xl border border-slate-300 bg-slate-50 px-5 py-4 text-right font-medium hover:border-slate-400">
          משחק זיהוי תמונות
        </button>
        <button className="rounded-3xl border border-slate-300 bg-slate-50 px-5 py-4 text-right font-medium hover:border-slate-400">
          השלמת משפטים
        </button>
        <button className="rounded-3xl border border-slate-300 bg-slate-50 px-5 py-4 text-right font-medium hover:border-slate-400">
          תרגום מהיר
        </button>
      </div>
    </section>
  );
}
