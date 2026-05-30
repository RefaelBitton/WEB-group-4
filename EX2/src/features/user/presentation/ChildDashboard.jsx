import React from 'react';
import { LearningStudio } from '../../../LearningStudio';
import { useUserStore } from '../data/userStore';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function ChildDashboard() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">לוח תלמיד</h1>
          <p className="text-slate-600 mt-1">שלום, {user?.name || 'תלמיד'}! מוכן לתרגל אנגלית?</p>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 font-medium transition-colors shadow-sm"
        >
          <LogOut className="h-5 w-5 ml-2" />
          התנתקות
        </button>
      </div>

      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <LearningStudio />
      </div>
    </div>
  );
}
