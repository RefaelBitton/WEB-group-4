import { LessonIcon } from "./LessonIcon.jsx";

export function LessonCard({ lesson, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lesson.id)}
      className={`bg-white rounded-2xl shadow-sm p-5 flex flex-col h-full text-right border-2 transition ${
        isSelected
          ? "border-indigo-500 ring-4 ring-indigo-100"
          : "border-transparent hover:border-slate-300"
      }`}
    >
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <LessonIcon name={lesson.icon} />
      </span>
      <span className="text-lg font-bold text-slate-800">{lesson.title}</span>
      <span className="text-sm text-slate-500 mt-1 flex-1">
        {lesson.description}
      </span>
      <span className="mt-4 text-sm font-medium text-indigo-700">
        {isSelected ? "השיעור נבחר" : "בחרו שיעור"}
      </span>
    </button>
  );
}
