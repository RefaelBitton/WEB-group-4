import { useMemo, useState } from "react";
import { LessonPicker } from "./components/learning-studio/LessonPicker.jsx";
import { PracticePanel } from "./components/learning-studio/PracticePanel.jsx";
import { ProgressPanel } from "./components/learning-studio/ProgressPanel.jsx";
import { lessons } from "./components/learning-studio/lessons.js";

export function LearningStudio() {
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

  return (
    <div className="space-y-6">
      <LessonPicker
        lessons={lessons}
        selectedLessonId={selectedLesson.id}
        onSelectLesson={selectLesson}
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <PracticePanel
          lesson={selectedLesson}
          answer={answer}
          feedback={feedback}
          onAnswerChange={setAnswer}
          onSubmit={checkAnswer}
        />

        <ProgressPanel
          lessons={lessons}
          getProgress={getLessonProgress}
          currentProgress={getLessonProgress(selectedLesson)}
        />
      </div>
    </div>
  );
}
