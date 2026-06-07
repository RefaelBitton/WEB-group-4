import React from 'react';
import { useUserStore } from '../data/userStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Star, Clock, Activity } from 'lucide-react';

export default function ParentPortal() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock child data
  const children = [
    { name: 'דניאל', points: 150, minutesPlayed: 45, level: 'מתחיל' }
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="mr-3 text-xl font-bold text-gray-900">פורטל הורים</span>
            </div>
            <div className="flex items-center">
              <span className="ml-4 text-gray-700">שלום, {user?.name || 'הורה'}</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-red-600 hover:text-red-800 transition-colors"
              >
                <LogOut className="h-5 w-5 ml-1" />
                התנתקות
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">הילדים שלי</h2>
          <p className="text-gray-600">עקבו אחר התקדמות הלמידה של ילדיכם</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                  {child.level}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Star className="h-5 w-5 ml-2 text-yellow-500" />
                  <span>נקודות: {child.points}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 ml-2 text-blue-500" />
                  <span>זמן משחק: {child.minutesPlayed} דקות</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Activity className="h-5 w-5 ml-2 text-purple-500" />
                  <span>סטטוס פעילות: פעיל</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button className="w-full py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
                  צפה בדוח מלא
                </button>
              </div>
            </div>
          ))}

          <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
              <span className="text-2xl">+</span>
            </div>
            <span className="font-semibold">הוסף ילד</span>
          </div>
        </div>
      </main>
    </div>
  );
}
