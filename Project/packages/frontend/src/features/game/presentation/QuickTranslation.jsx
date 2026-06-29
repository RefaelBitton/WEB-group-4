import React from "react";

export function QuickTranslation({ 
  questionData, 
  onAnswerSubmit, 
  onBack, 
  loading,
  selectedOptionId,
  correctOptionId,
  isAnswering
}) {
  if (!questionData) return <div className="text-center p-12">טוען נתונים...</div>;

  return (
    <section className="rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 md:p-12 shadow-sm text-center transition-colors duration-300">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">תרגום מהיר</h2>
      <p className="text-xl text-slate-505 dark:text-slate-400 mb-8">תרגמו את המילה שמוצגת לאנגלית.</p>
      
      <div className="bg-purple-50 dark:bg-purple-950/20 rounded-3xl p-10 text-center mb-8 border border-purple-100 dark:border-purple-900/30 transition-colors">
        <p className="text-4xl text-purple-900 dark:text-purple-200 font-extrabold">
          {questionData.text}
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {questionData.options.map((opt) => {
          const isSelected = opt.id === selectedOptionId;
          const isCorrect = opt.id === correctOptionId;
          const hasAnswered = selectedOptionId !== null;
          const hasResult = correctOptionId !== null;

          let btnStyles = "rounded-2xl border-2 px-6 py-5 text-center text-2xl font-bold transition-all cursor-pointer";
          
          if (!hasAnswered) {
            btnStyles += " border-slate-205 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:text-purple-700 dark:hover:text-purple-400 active:scale-95";
          } else {
            if (!hasResult) {
              if (isSelected) {
                btnStyles += " border-purple-400 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-305 animate-pulse";
              } else {
                btnStyles += " border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 opacity-40 cursor-not-allowed";
              }
            } else {
              if (isCorrect) {
                btnStyles += " bg-emerald-500 border-emerald-600 text-white shadow-md scale-105";
              } else if (isSelected) {
                btnStyles += " bg-rose-500 border-rose-600 text-white shadow-md shake-anim";
              } else {
                btnStyles += " border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 opacity-40 grayscale-[20%] cursor-not-allowed text-slate-600 dark:text-slate-400";
              }
            }
          }

          return (
            <button 
              key={opt.id}
              onClick={() => onAnswerSubmit(opt.id)}
              disabled={isAnswering || loading}
              className={`${btnStyles} disabled:cursor-not-allowed relative overflow-hidden flex items-center justify-center gap-2`}
            >
              <span>{opt.text}</span>
              {hasAnswered && hasResult && isCorrect && <span className="text-xl">✓</span>}
              {hasAnswered && hasResult && isSelected && !isCorrect && <span className="text-xl">✗</span>}
            </button>
          );
        })}
      </div>

      <button
        onClick={onBack}
        className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-605 dark:text-slate-350 hover:bg-slate-205 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
      >
        חזור למרכז המשחקים
      </button>
    </section>
  );
}
