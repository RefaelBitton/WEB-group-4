import React from 'react';
import { useUserStore } from '../data/userStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Gamepad2, MessageCircle } from 'lucide-react';

export default function ChildDashboard() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-purple-200/50 blur-3xl opacity-50 mix-blend-multiply animate-blob"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-200/50 blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000"></div>

      <div className="max-w-3xl w-full z-10 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 tracking-tight drop-shadow-sm">
            ברוך הבא, {user?.name || 'תלמיד'}!
          </h1>
          <p className="text-2xl text-slate-600 font-medium">מה תרצה לעשות היום?</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-stretch">
          <button
            onClick={() => navigate('/games')}
            className="flex-1 group flex flex-col items-center justify-center p-10 bg-white/80 backdrop-blur-xl border-2 border-indigo-100 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300"
          >
            <div className="w-24 h-24 mb-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
              <Gamepad2 className="w-12 h-12" />
            </div>
            <span className="text-3xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
              מרכז המשחקים
            </span>
            <span className="text-slate-500 mt-3 text-lg">שחק ולמד אנגלית</span>
          </button>
          
          <button
            onClick={() => navigate('/bot')}
            className="flex-1 group flex flex-col items-center justify-center p-10 bg-white/80 backdrop-blur-xl border-2 border-green-100 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-green-400 hover:bg-green-50 transition-all duration-300"
          >
            <div className="w-24 h-24 mb-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 shadow-inner">
              <MessageCircle className="w-12 h-12" />
            </div>
            <span className="text-3xl font-bold text-slate-800 group-hover:text-green-700 transition-colors">
              צ'אט עם הבוט
            </span>
            <span className="text-slate-500 mt-3 text-lg">תרגול שיחה חופשית</span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="mt-16 group flex items-center justify-center px-8 py-4 bg-white/60 backdrop-blur-md border border-slate-200 rounded-full text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 hover:shadow-md transition-all duration-300"
        >
          <LogOut className="h-6 w-6 ml-3 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xl font-medium">התנתקות</span>
        </button>
      </div>
    </div>
  );
}
