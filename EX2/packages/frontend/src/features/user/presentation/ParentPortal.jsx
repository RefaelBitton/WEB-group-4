import React, { useState, useEffect } from 'react';
import { useUserStore } from '../data/userStore';
import { useNavigate } from 'react-router-dom';
import { getChildren, addChild } from '../logic/api';
import { LogOut, BookOpen, Star, Clock, Activity, X } from 'lucide-react';

export default function ParentPortal() {
  const { user, token, logout } = useUserStore();
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [age, setAge] = useState('');
  const [englishLevel, setEnglishLevel] = useState('beginner');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchChildren = async () => {
      try {
        const data = await getChildren(token);
        setChildren(data.children || []);
      } catch (err) {
        console.error("Failed to load children", err);
      }
    };

    fetchChildren();
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (pin.length < 4) {
      setFormError('קוד PIN חייב להכיל 4 ספרות');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        name,
        username: username.toLowerCase().trim(),
        pin,
        age: age ? Number(age) : undefined,
        englishLevel,
      };
      await addChild(payload, token);
      
      // Refresh Children List
      const data = await getChildren(token);
      setChildren(data.children || []);
      
      // Reset and close
      setIsModalOpen(false);
      setName('');
      setUsername('');
      setPin('');
      setAge('');
      setEnglishLevel('beginner');
    } catch (err) {
      setFormError(err.message || 'שגיאה ביצירת תלמיד. אנא בדוק אם שם המשתמש כבר תפוס.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const translateLevel = (level) => {
    switch (level) {
      case 'beginner': return 'מתחיל';
      case 'basic': return 'בסיסי';
      case 'intermediate': return 'בינוני';
      default: return level || 'לא מוגדר';
    }
  };

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
            <div key={child._id || index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                  {translateLevel(child.englishLevel)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Star className="h-5 w-5 ml-2 text-yellow-500" />
                  <span>נקודות: {child.points || 0}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 ml-2 text-blue-500" />
                  <span>זמן משחק: {child.minutesPlayed || 0} דקות</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Activity className="h-5 w-5 ml-2 text-purple-500" />
                  <span>סטטוס פעילות: {child.active ? 'פעיל' : 'לא פעיל'}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button className="w-full py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
                  צפה בדוח מלא
                </button>
              </div>
            </div>
          ))}

          <div 
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
              <span className="text-2xl">+</span>
            </div>
            <span className="font-semibold">הוסף ילד</span>
          </div>
        </div>
      </main>

      {/* Add Child Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 left-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">הוספת חשבון ילד חדש</h3>
              <p className="text-gray-500 text-sm mb-6 text-center">מלאו את פרטי הילד כדי ליצור לו חשבון למידה אישי</p>

              {formError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddChild} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="למשל: דניאל כהן"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם משתמש (לחיבור)</label>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="שם משתמש באנגלית או עברית (ללא רווחים)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">קוד PIN (4 ספרות)</label>
                    <input 
                      type="password" 
                      required
                      maxLength={4}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900 text-left font-mono tracking-widest"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">גיל (שנים)</label>
                    <input 
                      type="number" 
                      min={6}
                      max={12}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="6-12"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">רמת אנגלית</label>
                  <select 
                    value={englishLevel} 
                    onChange={(e) => setEnglishLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
                  >
                    <option value="beginner">מתחיל (Beginner)</option>
                    <option value="basic">בסיסי (Basic)</option>
                    <option value="intermediate">בינוני (Intermediate)</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'יוצר...' : 'צור חשבון'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
