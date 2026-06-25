import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-50 p-3.5 md:p-4 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center border border-indigo-500/20"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <Sun className="w-6 h-6 text-yellow-300" /> : <Moon className="w-6 h-6 text-indigo-100" />}
    </button>
  );
}
