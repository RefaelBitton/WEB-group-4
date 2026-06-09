import React from "react";

export function SentenceCompletion({ questionData, onAnswerSubmit, onBack }) {
  if (!questionData) return <div className="text-center p-12">טוען נתונים...</div>;

  return (
    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-12 shadow-sm text-center">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">השלמת משפטים</h2>
      <p className="text-xl text-slate-500 mb-8">בחרו את המילה הנכונה להשלמת המשפט.</p>
      
      <div className="bg-blue-50 rounded-3xl p-10 text-center mb-8 border border-blue-100">
        <p className="text-3xl text-blue-900 font-bold" dir="ltr">
          {questionData.text}
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {questionData.options.map((opt) => (
          <button 
            key={opt.id}
            onClick={() => onAnswerSubmit(opt.id)}
            className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-6 py-5 text-center text-2xl font-bold hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-pointer"
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
