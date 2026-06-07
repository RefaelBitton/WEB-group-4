import { LessonCard } from "./LessonCard.jsx";

export function LessonPicker({ lessons, selectedLessonId, onSelectLesson }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          isSelected={lesson.id === selectedLessonId}
          onSelect={onSelectLesson}
        />
      ))}
    </div>
  );
}
