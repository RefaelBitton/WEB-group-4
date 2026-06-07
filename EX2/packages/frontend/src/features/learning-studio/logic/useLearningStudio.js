import { useMemo, useState } from "react";
import { lessons } from "../data/lessons.js";

export function useLearningStudio() {
  const [selectedId, setSelectedId] = useState(lessons[0].id);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [bonusProgress, setBonusProgress] = useState({});

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedId) ?? lessons[0],
    [selectedId],
  );

  function getLessonProgress(lesson) {
    return Math.min(100, lesson.progress + (bonusProgress[lesson.id] ?? 0));
  }

  function selectLesson(lessonId) {
    setSelectedId(lessonId);
    setAnswer("");
    setFeedback("");
  }

  function checkAnswer(event) {
    event.preventDefault();

    const isCorrect = answer.trim().toLowerCase() === selectedLesson.answer;
    if (!isCorrect) {
      setFeedback("כמעט! נסו שוב לפי המילה שבכרטיס.");
      return;
    }

    setFeedback("מעולה! התקדמות השיעור עלתה.");
    setBonusProgress((current) => ({
      ...current,
      [selectedLesson.id]: Math.min((current[selectedLesson.id] ?? 0) + 5, 30),
    }));
  }

  return {
    lessons,
    selectedLesson,
    answer,
    feedback,
    bonusProgress,
    getLessonProgress,
    selectLesson,
    setAnswer,
    checkAnswer,
  };
}
