import React from 'react';
import { useUserStore } from '../data/userStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Gamepad2, MessageCircle, Trophy, Mic } from 'lucide-react';

export default function ChildDashboard() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20 flex items-center justify-center p-6 pb-28 md:pb-6 relative overflow-hidden transition-colors duration-300" dir="rtl">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-purple-200/50 dark:bg-purple-900/10 blur-3xl opacity-50 dark:opacity-20 mix-blend-multiply animate-blob"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-200/50 dark:bg-indigo-900/10 blur-3xl opacity-50 dark:opacity-20 mix-blend-multiply animate-blob animation-delay-2000"></div>

      <div className="max-w-4xl w-full z-10 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4 tracking-tight drop-shadow-sm">
            ברוך הבא, {user?.name || 'תלמיד'}!
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-350 font-medium">מה תרצה לעשות היום?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full justify-center items-stretch">
          <button
            onClick={() => navigate('/games')}
            className="group flex flex-col items-center justify-center p-8 md:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-indigo-100 dark:border-slate-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all duration-300 cursor-pointer"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 mb-4 md:mb-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:text-white transition-all duration-300 shadow-inner">
              <Gamepad2 className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <span className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
              מרכז המשחקים
            </span>
            <span className="text-slate-500 dark:text-slate-400 mt-2 text-base md:text-lg">שחק ולמד אנגלית</span>
          </button>
          
          <button
            onClick={() => navigate('/bot')}
            className="group flex flex-col items-center justify-center p-8 md:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-green-100 dark:border-slate-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-300 cursor-pointer"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 mb-4 md:mb-6 rounded-full bg-green-100 dark:bg-green-950/60 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white dark:group-hover:text-white transition-all duration-300 shadow-inner">
              <MessageCircle className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <span className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
              צ'אט עם הבוט
            </span>
            <span className="text-slate-500 dark:text-slate-400 mt-2 text-base md:text-lg">תרגול שיחה חופשית</span>
          </button>

          <button
            onClick={() => navigate('/grammar-hero')}
            className="group flex flex-col items-center justify-center p-8 md:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-amber-100 dark:border-slate-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all duration-300 cursor-pointer"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 mb-4 md:mb-6 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-white transition-all duration-300 shadow-inner">
              <Trophy className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <span className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              גיבור הדקדוק
            </span>
            <span className="text-slate-500 dark:text-slate-400 mt-2 text-base md:text-lg">פרופיל הישגים ונקודות</span>
          </button>

          <button
            onClick={() => navigate('/arena')}
            className="group flex flex-col items-center justify-center p-8 md:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-indigo-100 dark:border-slate-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all duration-300 cursor-pointer"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 mb-4 md:mb-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:text-white transition-all duration-300 shadow-inner">
              <Mic className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <span className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
              זירת האימון באנגלית
            </span>
            <span className="text-slate-500 dark:text-slate-400 mt-2 text-base md:text-lg">תרגול דיבור קבוצתי</span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="hidden md:flex mt-16 group items-center justify-center px-8 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-450 hover:border-rose-200 dark:hover:border-rose-900 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
          <LogOut className="h-6 w-6 ml-3 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xl font-medium">התנתקות</span>
        </button>
      </div>
    </div>
  );
}
