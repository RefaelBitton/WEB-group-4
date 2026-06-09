import React from "react";

export function ImageRecognition({ questionData, onAnswerSubmit, onBack }) {
  if (!questionData) return <div className="text-center p-12">טוען נתונים...</div>;

  return (
    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-12 shadow-sm text-center">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">משחק זיהוי תמונות</h2>
      <p className="text-xl text-slate-500 mb-8">לחצו על האפשרות שמתארת את התמונה בצורה הטובה ביותר.</p>
      
      <div className="bg-slate-100 rounded-3xl h-64 w-full flex items-center justify-center mb-8 overflow-hidden">
        {questionData.imageUrl ? (
          <img src={questionData.imageUrl} alt="Game visual" className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-400 text-lg">תמונה תוצג כאן</span>
        )}
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {questionData.options.map((opt) => (
          <button 
            key={opt.id}
            onClick={() => onAnswerSubmit(opt.id)}
            className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-6 py-5 text-center text-xl font-bold hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-all cursor-pointer"
          >
            {opt.text}
          </button>
        ))}
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
