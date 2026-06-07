import React from 'react';
import { LessonCard } from "./LessonCard.jsx";

export function LessonPicker({ lessons, selectedLessonId, onSelectLesson }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          isSelected={lesson.id === selectedLessonId}
          onSelect={() => onSelectLesson(lesson.id)}
        />
      ))}
    </div>
  );
}
