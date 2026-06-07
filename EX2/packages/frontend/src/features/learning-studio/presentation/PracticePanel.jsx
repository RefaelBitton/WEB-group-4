export function PracticePanel({ lesson, answer, feedback, onAnswerChange, onSubmit }) {
  return (
    <section className="xl:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">תרגול שיעור</h2>
      <p className="text-slate-600 mb-6">{lesson.prompt}</p>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 text-right mb-2">התשובה שלך</label>
          <input
            type="text"
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="הקלידו כאן את התשובה באנגלית"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-indigo-500 px-4 py-3 text-white font-medium hover:bg-indigo-600"
        >
          בדוק תשובה
        </button>
      </form>

      {feedback ? (
        <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-slate-700">{feedback}</p>
      ) : null}
    </section>
  );
}
