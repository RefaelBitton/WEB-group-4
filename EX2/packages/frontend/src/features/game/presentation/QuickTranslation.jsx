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
    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-12 shadow-sm text-center">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">תרגום מהיר</h2>
      <p className="text-xl text-slate-500 mb-8">תרגמו את המילה שמוצגת לאנגלית.</p>
      
      <div className="bg-purple-50 rounded-3xl p-10 text-center mb-8 border border-purple-100">
        <p className="text-4xl text-purple-900 font-extrabold">
          {questionData.text}
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {questionData.options.map((opt) => {
          const isSelected = opt.id === selectedOptionId;
          const isCorrect = opt.id === correctOptionId;
          const hasAnswered = selectedOptionId !== null;

          let btnStyles = "rounded-2xl border-2 border-slate-200 bg-slate-50 px-6 py-5 text-center text-2xl font-bold transition-all cursor-pointer";
          
          if (!hasAnswered) {
            btnStyles += " hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 active:scale-95";
          } else {
            if (isCorrect) {
              btnStyles += " bg-emerald-500 border-emerald-600 text-white shadow-md scale-105";
            } else if (isSelected) {
              btnStyles += " bg-rose-500 border-rose-600 text-white shadow-md shake-anim";
            } else {
              btnStyles += " opacity-40 grayscale-[20%] cursor-not-allowed";
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
              {hasAnswered && isCorrect && <span className="text-xl">✓</span>}
              {hasAnswered && isSelected && !isCorrect && <span className="text-xl">✗</span>}
            </button>
          );
        })}
      </div>

      <button
        onClick={onBack}
        className="px-6 py-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium transition-colors"
      >
        חזור למרכז המשחקים
      </button>
    </section>
  );
}
