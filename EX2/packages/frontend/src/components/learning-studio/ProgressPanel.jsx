import { ProgressBar } from "./ProgressBar.jsx";

export function ProgressPanel({ lessons, getProgress, currentProgress }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 xl:col-span-2">
      <h3 className="text-xl font-bold text-slate-800 mb-4">
        ההתקדמות הנוכחית
      </h3>
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <ProgressBar
            key={lesson.id}
            label={lesson.title}
            value={getProgress(lesson)}
          />
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <p className="text-sm text-slate-500">השיעור הפעיל</p>
        <p className="mt-1 text-2xl font-bold text-slate-800">
          {currentProgress}%
        </p>
      </div>
    </section>
  );
}
