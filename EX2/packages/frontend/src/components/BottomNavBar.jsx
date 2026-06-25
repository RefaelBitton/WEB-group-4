import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../features/user/data/userStore';
import { Home, Gamepad2, MessageCircle, Trophy, Mic, LogOut } from 'lucide-react';

export default function BottomNavBar() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || user.role !== 'child') return null;

  const navItems = [
    { path: '/child', icon: Home, label: 'ראשי' },
    { path: '/games', icon: Gamepad2, label: 'משחקים' },
    { path: '/bot', icon: MessageCircle, label: 'בוט' },
    { path: '/arena', icon: Mic, label: 'זירה' },
    { path: '/grammar-hero', icon: Trophy, label: 'גיבור' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:hidden px-4 py-2.5 flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive 
                ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40' 
                : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[10px]">התנתק</span>
      </button>
    </div>
  );
}
