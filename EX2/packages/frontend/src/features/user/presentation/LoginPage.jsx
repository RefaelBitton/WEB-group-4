export function LoginPage() {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-right">
      <h2 className="text-2xl font-bold text-slate-900">כניסה למערכת</h2>
      <p className="text-slate-500">הכנס שם משתמש וסיסמה כדי להתחבר.</p>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">שם משתמש</label>
        <input
          type="text"
          placeholder="הקלד שם משתמש"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">סיסמה</label>
        <input
          type="password"
          placeholder="הקלד סיסמה"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button className="w-full rounded-2xl bg-indigo-500 px-4 py-3 text-white font-medium hover:bg-indigo-600">
        התחבר
      </button>
    </section>
  );
}
