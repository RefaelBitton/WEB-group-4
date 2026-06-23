import React, { useState } from "react";

export function ImageRecognition({ questionData, onAnswerSubmit, onBack, loading }) {
  const [imageError, setImageError] = useState(false);

  if (!questionData) return <div className="text-center p-12">טוען נתונים...</div>;

  // Convert external image URLs to use our proxy endpoint
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return `/api/games/image/proxy?url=${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl;
  };

  const proxiedImageUrl = getImageUrl(questionData.imageUrl);

  return (
    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-12 shadow-sm text-center">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">משחק זיהוי תמונות</h2>
      <p className="text-xl text-slate-500 mb-8">לחצו על האפשרות שמתארת את התמונה בצורה הטובה ביותר.</p>
      
      <div className="bg-slate-50 border border-slate-100 rounded-3xl h-80 md:h-[28rem] w-full flex items-center justify-center mb-8 overflow-hidden">
        {proxiedImageUrl && !imageError ? (
          <img
            src={proxiedImageUrl}
            alt="Game visual"
            className="max-w-full max-h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : imageError ? (
          <div className="text-center px-6">
            <p className="text-red-500 font-semibold mb-2">שגיאה בטעינת התמונה.</p>
            <p className="text-sm text-slate-500 mb-3">נסה לרענן את הדף או להפעיל את השרת מחדש.</p>
            <p className="text-xs text-slate-400 break-all">URL שניסינו לטעון: {proxiedImageUrl}</p>
          </div>
        ) : (
          <span className="text-slate-400 text-lg">תמונה תוצג כאן</span>
        )}
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {questionData.options.map((opt) => (
          <button 
            key={opt.id}
            onClick={() => onAnswerSubmit(opt.id)}
            disabled={loading}
            className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-6 py-5 text-center text-xl font-bold hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
