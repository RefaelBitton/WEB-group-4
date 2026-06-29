import React from 'react';

export function ProgressPanel({ lessons, getProgress, currentProgress }) {
  return (
    <aside className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">התקדמות כללית</h2>
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800">{lesson.title}</span>
              <span className="text-sm text-slate-500">{getProgress(lesson)}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${getProgress(lesson)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl bg-indigo-50 p-4 text-slate-700">
        <p className="font-medium">שיעור נבחר</p>
        <p className="mt-2">התקדמות נוכחית: {currentProgress}%</p>
      </div>
    </aside>
  );
}
