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
    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-12 shadow-sm text-center">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">משחק זיהוי תמונות</h2>
      <p className="text-xl text-slate-500 mb-8">לחצו על האפשרות שמתארת את התמונה בצורה הטובה ביותר.</p>
      
      <div className="bg-slate-50 border border-slate-100 rounded-3xl h-80 md:h-112 w-full flex items-center justify-center mb-8 overflow-hidden">
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
        {questionData.options.map((opt) => {
          const isSelected = opt.id === selectedOptionId;
          const isCorrect = opt.id === correctOptionId;
          const hasAnswered = selectedOptionId !== null;

          let btnStyles = "rounded-2xl border-2 border-slate-200 bg-slate-50 px-6 py-5 text-center text-xl font-bold transition-all cursor-pointer";
          
          if (!hasAnswered) {
            btnStyles += " hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95";
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
