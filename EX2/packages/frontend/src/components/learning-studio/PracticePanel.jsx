import { FeedbackMessage } from "./FeedbackMessage.jsx";

export function PracticePanel({
  lesson,
  answer,
  feedback,
  onAnswerChange,
  onSubmit,
}) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 xl:col-span-3">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">תרגול עכשיו</p>
          <h3 className="text-xl font-bold text-slate-800 mt-1">
            {lesson.title}
          </h3>
        </div>
        <span className="self-start rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
          {lesson.example}
        </span>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label
          htmlFor="practice-answer"
          className="block text-lg font-bold text-slate-800"
        >
          {lesson.question}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="practice-answer"
            type="text"
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={lesson.word}
            dir="ltr"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-500 px-6 py-3 font-medium text-white hover:bg-indigo-600"
          >
            בדיקה
          </button>
        </div>
      </form>

      <FeedbackMessage message={feedback} />
    </section>
  );
}
