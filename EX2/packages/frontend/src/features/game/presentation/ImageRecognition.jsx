import React, { useState } from "react";

export function ImageRecognition({ 
  questionData, 
  onAnswerSubmit, 
  onBack, 
  loading,
  selectedOptionId,
  correctOptionId,
  isAnswering
}) {
  const [imageError, setImageError] = useState(false);

  if (!questionData) return <div className="text-center p-12">טוען נתונים...</div>;

  // Convert external image URLs to use our proxy endpoint
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    const apiUrl = import.meta.env.VITE_API_URL || "";
    // images.cocodataset.org has a broken SSL certificate, so the browser
    // cannot load them directly via HTTPS.  Downgrade to HTTP and proxy
    // through our backend to avoid both SSL errors and mixed-content blocking.
    if (imageUrl.includes("images.cocodataset.org")) {
      const httpUrl = imageUrl.replace(/^https:\/\//, "http://");
      return `${apiUrl}/api/games/image/proxy?url=${encodeURIComponent(httpUrl)}`;
    }
    // Other HTTP images must be proxied to avoid mixed-content blocking on HTTPS sites
    if (imageUrl.startsWith("http://")) {
      return `${apiUrl}/api/games/image/proxy?url=${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl;
  };

  const proxiedImageUrl = getImageUrl(questionData.imageUrl);

  return (
    <section className="rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 md:p-12 shadow-sm text-center transition-colors duration-300">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">משחק זיהוי תמונות</h2>
      <p className="text-xl text-slate-500 dark:text-slate-400 mb-8">לחצו על האפשרות שמתארת את התמונה בצורה הטובה ביותר.</p>
      
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl h-80 md:h-112 w-full flex items-center justify-center mb-8 overflow-hidden transition-colors">
        {proxiedImageUrl && !imageError ? (
          <img
            src={proxiedImageUrl}
            alt="Game visual"
            className="max-w-full max-h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : imageError ? (
          <div className="text-center px-6">
            <p className="text-red-500 dark:text-red-400 font-semibold mb-2">שגיאה בטעינת התמונה.</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">נסה לרענן את הדף או להפעיל את השרת מחדש.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 break-all">URL שניסינו לטעון: {proxiedImageUrl}</p>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-lg">תמונה תוצג כאן</span>
        )}
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {questionData.options.map((opt) => {
          const isSelected = opt.id === selectedOptionId;
          const isCorrect = opt.id === correctOptionId;
          const hasAnswered = selectedOptionId !== null;
          const hasResult = correctOptionId !== null;

          let btnStyles = "rounded-2xl border-2 px-6 py-5 text-center text-xl font-bold transition-all cursor-pointer";
          
          if (!hasAnswered) {
            btnStyles += " border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-700 dark:hover:text-indigo-400 active:scale-95";
          } else {
            if (!hasResult) {
              if (isSelected) {
                btnStyles += " border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 animate-pulse";
              } else {
                btnStyles += " border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 opacity-40 cursor-not-allowed";
              }
            } else {
              if (isCorrect) {
                btnStyles += " bg-emerald-500 border-emerald-600 text-white shadow-md scale-105";
              } else if (isSelected) {
                btnStyles += " bg-rose-500 border-rose-600 text-white shadow-md shake-anim";
              } else {
                btnStyles += " border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 opacity-40 grayscale-[20%] cursor-not-allowed text-slate-600 dark:text-slate-400";
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
        className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
      >
        חזור למרכז המשחקים
      </button>
    </section>
  );
}
