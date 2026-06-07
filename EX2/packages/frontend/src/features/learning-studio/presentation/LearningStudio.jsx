import { LessonPicker } from "./LessonPicker.jsx";
import { PracticePanel } from "./PracticePanel.jsx";
import { ProgressPanel } from "./ProgressPanel.jsx";
import { useLearningStudio } from "../logic/useLearningStudio.js";

export function LearningStudio() {
  const {
    lessons,
    selectedLesson,
    answer,
    feedback,
    getLessonProgress,
    selectLesson,
    setAnswer,
    checkAnswer,
  } = useLearningStudio();

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
