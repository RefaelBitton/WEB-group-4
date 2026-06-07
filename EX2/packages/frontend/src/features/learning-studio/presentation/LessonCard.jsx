import React from 'react';

export function LessonCard({ lesson, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-3xl border p-5 text-right transition-all duration-200 ${
        isSelected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-400"
      }`}
    >
      <h3 className="text-lg font-semibold text-slate-900">{lesson.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{lesson.description}</p>
      <p className="mt-4 text-sm font-medium text-slate-700">{lesson.prompt}</p>
    </button>
  );
}
