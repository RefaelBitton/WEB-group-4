import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserStore } from '../data/userStore';
import { useNavigate } from 'react-router-dom';
import { getChildren, addChild, getChildReport, getChildGamification } from '../logic/api';
import { createParentReportSocket } from '../logic/reportSocket';
import { LogOut, BookOpen, Star, Clock, Activity, X, TrendingUp, Award, MessageCircle, Gamepad2, Calendar, AlertCircle, Bell, Wifi, WifiOff } from 'lucide-react';

const eventTypeLabels = {
  chat: 'שיחת צ׳אט',
  game: 'משחק לימודי',
  arena: 'זירת שיחה',
};

const achievementLabels = {
  FIRST_CORRECT_SENTENCE: 'המשפט הראשון שלי',
  FIRST_GAME_COMPLETED: 'אלוף המשחקים',
  PLAYED_10_MINS: 'מתאמן מתמיד',
  ARENA_CHALLENGER: 'לוחם זירת השיחה',
  CHAT_MASTER: 'אלוף השיחה',
  VOCABULARY_EXPLORER: 'חוקר אוצר המילים',
  POINT_CENTURY: 'מאה ראשונה',
  HALF_MILLENNIUM: 'חצי דרך לפסגה',
};

const buildActivityToast = (childName, data) => {
  const activity = eventTypeLabels[data?.activityType] || 'פעילות חדשה';
  if (data?.activityType === 'game') {
    return `${childName} השלים/ה ${activity}${data.gameId ? `: ${data.gameId}` : ''}`;
  }
  return `${childName} ביצע/ה ${activity}`;
};

const buildMilestoneToast = (childName, data) => {
  if (data?.newRank) {
    return `${childName} עלה/תה לרמה חדשה: ${data.newRank}`;
  }
  const achievement = achievementLabels[data?.newAchievement] || data?.newAchievement || 'הישג חדש';
  return `${childName} קיבל/ה הישג חדש: ${achievement}`;
};

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

  // Report Modal States
  const [selectedChild, setSelectedChild] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [liveToasts, setLiveToasts] = useState([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState(null);

  const childNameById = useMemo(() => {
    return children.reduce((map, child) => {
      map[child._id] = child.name;
      return map;
    }, {});
  }, [children]);

  const pushLiveToast = useCallback((message, tone = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setLiveToasts((current) => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      setLiveToasts((current) => current.filter((toast) => toast.id !== id));
    }, 5500);
  }, []);

  const refreshSelectedReport = useCallback(async (childId = selectedChild?._id) => {
    if (!childId || !token) return;
    try {
      const data = await getChildReport(childId, token);
      setReportData(data);
      setReportError('');
    } catch (err) {
      setReportError(err.message || 'שגיאה בעדכון דוח ההתקדמות.');
    }
  }, [selectedChild?._id, token]);

  const handleOpenReport = async (child) => {
    setSelectedChild(child);
    setIsReportModalOpen(true);
    setReportLoading(true);
    setReportError('');
    setReportData(null);
    try {
      const data = await getChildReport(child._id, token);
      setReportData(data);
    } catch (err) {
      setReportError(err.message || 'שגיאה בטעינת דוח ההתקדמות.');
    } finally {
      setReportLoading(false);
    }
  };

  const loadChildrenData = useCallback(async () => {
    try {
      const data = await getChildren(token);
      const childList = data.children || [];
      
      const enrichedChildren = await Promise.all(
        childList.map(async (child) => {
          try {
            const [report, game] = await Promise.all([
              getChildReport(child._id, token).catch(() => null),
              getChildGamification(child._id, token).catch(() => null),
            ]);

            return {
              ...child,
              points: game ? game.points : 0,
              minutesPlayed: report ? report.timeSpent?.total : 0
            };
          } catch (err) {
            console.error(`Failed to fetch report for child ${child._id}`, err);
            return child;
          }
        })
      );
      setChildren(enrichedChildren);
    } catch (err) {
      console.error("Failed to load children", err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    loadChildrenData();
  }, [token, navigate, loadChildrenData]);

  useEffect(() => {
    if (!token || children.length === 0) return;

    const childIds = new Set(children.map((child) => child._id));

    const handleRelevantUpdate = async (userId) => {
      setLastLiveUpdate(new Date());
      await loadChildrenData();
      if (selectedChild?._id === userId) {
        await refreshSelectedReport(userId);
      }
    };

    const socket = createParentReportSocket({
      onConnectChange: setIsSocketConnected,
      onActivity: (data) => {
        if (!data?.userId || !childIds.has(data.userId)) return;
        const childName = childNameById[data.userId] || 'הילד';
        pushLiveToast(buildActivityToast(childName, data), 'activity');
        handleRelevantUpdate(data.userId);
      },
      onMilestone: (data) => {
        if (!data?.userId || !childIds.has(data.userId)) return;
        const childName = childNameById[data.userId] || 'הילד';
        pushLiveToast(buildMilestoneToast(childName, data), 'milestone');
        handleRelevantUpdate(data.userId);
      },
    });

    return () => {
      socket.disconnect();
      setIsSocketConnected(false);
    };
  }, [token, children, childNameById, selectedChild?._id, loadChildrenData, refreshSelectedReport, pushLiveToast]);

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
      await loadChildrenData();
      
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
    <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="mr-3 text-xl font-bold text-gray-900 dark:text-white">פורטל הורים</span>
            </div>
            <div className="flex items-center">
              <span className="ml-4 text-gray-750 dark:text-gray-300">שלום, {user?.name || 'הורה'}</span>
              <div className={`hidden sm:flex items-center gap-1.5 ml-4 px-3 py-1 rounded-full text-xs font-bold ${isSocketConnected ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700'}`}>
                {isSocketConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                {isSocketConnected ? 'עדכונים חיים' : 'ממתין לחיבור'}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-red-650 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="h-5 w-5 ml-1" />
                התנתקות
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="fixed top-20 left-4 z-[60] space-y-3 w-[min(22rem,calc(100vw-2rem))]">
        {liveToasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-xl rounded-2xl p-4 flex items-start gap-3 text-right ${
              toast.tone === 'milestone' ? 'border-amber-200 dark:border-amber-900/50' : 'border-indigo-200 dark:border-indigo-900/50'
            }`}
          >
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              toast.tone === 'milestone' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
            }`}>
              {toast.tone === 'milestone' ? <Award className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-gray-900 dark:text-white">{toast.tone === 'milestone' ? 'הישג חדש' : 'פעילות חדשה'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-0.5">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">הילדים שלי</h2>
          <p className="text-gray-600 dark:text-gray-405">עקבו אחר התקדמות הלמידה של ילדיכם</p>
          {lastLiveUpdate && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              עדכון חי אחרון: {lastLiveUpdate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child, index) => (
            <div key={child._id || index} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{child.name}</h3>
                <span className="px-3 py-1 bg-green-105 dark:bg-green-950/60 text-green-800 dark:text-green-300 text-sm font-semibold rounded-full">
                  {translateLevel(child.englishLevel)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-650 dark:text-gray-300">
                  <Star className="h-5 w-5 ml-2 text-yellow-500 animate-pulse" />
                  <span>נקודות: {child.points || 0}</span>
                </div>
                <div className="flex items-center text-gray-655 dark:text-gray-300">
                  <Clock className="h-5 w-5 ml-2 text-blue-500" />
                  <span>זמן משחק: {child.minutesPlayed || 0} דקות</span>
                </div>
                <div className="flex items-center text-gray-655 dark:text-gray-350">
                  <Activity className="h-5 w-5 ml-2 text-purple-500" />
                  <span>סטטוס פעילות: {child.active ? 'פעיל' : 'לא פעיל'}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                <button 
                  onClick={() => handleOpenReport(child)}
                  className="w-full py-2 bg-indigo-55 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                >
                  צפה בדוח מלא
                </button>
              </div>
            </div>
          ))}

          <div 
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-50 dark:bg-slate-900/40 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-750 p-6 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-505 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all duration-300 cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-3 shadow-sm">
              <span className="text-2xl">+</span>
            </div>
            <span className="font-semibold">הוסף ילד</span>
          </div>
        </div>
      </main>

      {/* Add Child Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative border dark:border-slate-800 transition-colors duration-300">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 left-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">הוספת חשבון ילד חדש</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center">מלאו את פרטי הילד כדי ליצור לו חשבון למידה אישי</p>

              {formError && (
                <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm text-center border border-red-100 dark:border-red-900/50">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddChild} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">שם מלא</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="למשל: דניאל כהן"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">שם משתמש (לחיבור)</label>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="שם משתמש באנגלית או עברית (ללא רווחים)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">קוד PIN (4 ספרות)</label>
                    <input 
                      type="password" 
                      required
                      maxLength={4}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-left font-mono tracking-widest transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">גיל (שנים)</label>
                    <input 
                      type="number" 
                      min={6}
                      max={12}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="6-12"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">רמת אנגלית</label>
                  <select 
                    value={englishLevel} 
                    onChange={(e) => setEnglishLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white transition-colors"
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
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'מוסיף...' : 'הוסף ילד'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal Dialog */}
      {isReportModalOpen && selectedChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col border dark:border-slate-800 transition-colors duration-300">
            <button 
              onClick={() => setIsReportModalOpen(false)} 
              className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-350 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10 cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-slate-850 transition-colors">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                דוח התקדמות עבור {selectedChild.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                רמת אנגלית: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{translateLevel(selectedChild.englishLevel)}</span> | גיל: {selectedChild.age || 'לא מוגדר'}
              </p>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {reportLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="h-12 w-12 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-500 dark:text-gray-450 font-semibold">טוען נתונים מהשרת...</span>
                </div>
              )}

              {reportError && (
                <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-900/50">
                  <AlertCircle className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">שגיאה בטעינת הנתונים</h4>
                    <p className="text-sm">{reportError}</p>
                  </div>
                </div>
              )}

              {!reportLoading && !reportError && reportData && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/10 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                      <div className="flex justify-between items-start mb-2">
                        <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs text-indigo-600 dark:text-indigo-450 font-semibold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm">דק׳</span>
                      </div>
                      <p className="text-xs text-gray-505 dark:text-gray-405 font-semibold">זמן תרגול כולל</p>
                      <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{reportData.timeSpent?.total || 0}</h4>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/10 p-4 rounded-2xl border border-green-100/50 dark:border-green-900/30">
                      <div className="flex justify-between items-start mb-2">
                        <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-green-600 dark:text-green-455 font-semibold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm">הצלחה</span>
                      </div>
                      <p className="text-xs text-gray-550 dark:text-gray-400 font-semibold">אחוז הצלחה</p>
                      <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{reportData.successRates?.overall || 0}%</h4>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/10 p-4 rounded-2xl border border-purple-100/50 dark:border-purple-900/30">
                      <div className="flex justify-between items-start mb-2">
                        <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs text-purple-600 dark:text-purple-450 font-semibold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm">צ'אט</span>
                      </div>
                      <p className="text-xs text-gray-550 dark:text-gray-400 font-semibold">הצלחה בצ'אט</p>
                      <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{reportData.successRates?.chat || 0}%</h4>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/10 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/30">
                      <div className="flex justify-between items-start mb-2">
                        <Gamepad2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs text-amber-600 dark:text-amber-450 font-semibold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm">משחקים</span>
                      </div>
                      <p className="text-xs text-gray-550 dark:text-gray-400 font-semibold">הצלחה במשחקים</p>
                      <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{reportData.successRates?.game || 0}%</h4>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-base flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      מדדי הצלחה
                    </h4>
                    <div className="space-y-4">
                      {[
                        { label: 'הצלחה כוללת', value: reportData.successRates?.overall || 0, color: 'bg-green-500' },
                        { label: 'שיחות צ׳אט', value: reportData.successRates?.chat || 0, color: 'bg-purple-500' },
                        { label: 'משחקים', value: reportData.successRates?.game || 0, color: 'bg-amber-500' },
                      ].map((metric) => (
                        <div key={metric.label}>
                          <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            <span>{metric.label}</span>
                            <span>{metric.value}%</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                            <div
                              className={`${metric.color} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${Math.min(100, metric.value)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time breakdown & Subjects */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Time Breakdown details */}
                    <div className="bg-gray-50 dark:bg-slate-850 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-500" />
                        חלוקת זמן תרגול
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            <span>שיחות צ'אט</span>
                            <span>{reportData.timeSpent?.breakdown?.chat || 0} דק׳</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-purple-500 h-full rounded-full" 
                              style={{ width: `${Math.min(100, ((reportData.timeSpent?.breakdown?.chat || 0) / (reportData.timeSpent?.total || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            <span>משחקים לימודיים</span>
                            <span>{reportData.timeSpent?.breakdown?.game || 0} דק׳</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full" 
                              style={{ width: `${Math.min(100, ((reportData.timeSpent?.breakdown?.game || 0) / (reportData.timeSpent?.total || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            <span>זירת שיחה (P2P)</span>
                            <span>{reportData.timeSpent?.breakdown?.arena || 0} דק׳</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500 h-full rounded-full" 
                              style={{ width: `${Math.min(100, ((reportData.timeSpent?.breakdown?.arena || 0) / (reportData.timeSpent?.total || 1)) * 105)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subjects Covered */}
                    <div className="bg-gray-50 dark:bg-slate-850 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-500" />
                        נושאים ותחומי תרגול
                      </h4>
                      {(!reportData.subjectsCovered || reportData.subjectsCovered.length === 0) ? (
                        <p className="text-gray-550 dark:text-gray-405 text-xs italic text-center py-4">אין עדיין נושאים מתועדים</p>
                      ) : (
                        <div className="space-y-3">
                          {reportData.subjectsCovered.map((sub, idx) => {
                            const maxCount = Math.max(...reportData.subjectsCovered.map((item) => item.count || 0), 1);
                            const width = Math.max(8, Math.round(((sub.count || 0) / maxCount) * 100));
                            return (
                              <div key={idx}>
                                <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                  <span className="truncate max-w-[70%]">{sub.subject}</span>
                                  <span>{sub.count}</span>
                                </div>
                                <div className="w-full bg-white dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-gray-100 dark:border-slate-700">
                                  <div
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${width}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Achievements section */}
                  <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-base flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      הישגים וגביעים שנצברו ({reportData.achievements?.length || 0})
                    </h4>
                    {(!reportData.achievements || reportData.achievements.length === 0) ? (
                      <p className="text-gray-500 dark:text-gray-400 text-xs italic text-center py-6">אין עדיין הישגים מתועדים. המשיכו לתרגל כדי לזכות בגביעים!</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {reportData.achievements.map((ach, idx) => (
                          <div key={ach.id || idx} className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50/60 to-amber-100/10 dark:from-amber-950/20 dark:to-amber-900/10 rounded-2xl border border-amber-100/30 dark:border-amber-900/20 shadow-sm">
                            <div className="h-10 w-10 bg-amber-100 dark:bg-amber-950/60 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                              <Award className="h-6 w-6" />
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-gray-950 dark:text-white">{ach.title}</h5>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{ach.description}</p>
                              <span className="inline-block mt-2 text-[10px] font-black text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                                +{ach.points} נקודות
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Activities timeline */}
                  <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-base flex items-center gap-2">
                      <Activity className="h-5 w-5 text-indigo-500" />
                      יומן פעילות אחרון (עד 10 פעילויות)
                    </h4>
                    {(!reportData.recentActivities || reportData.recentActivities.length === 0) ? (
                      <p className="text-gray-500 dark:text-gray-450 text-xs italic text-center py-6">אין עדיין פעילויות מתועדות</p>
                    ) : (
                      <div className="space-y-3">
                        {reportData.recentActivities.map((act, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-850 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-750 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                                act.activityType === 'chat' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' :
                                act.activityType === 'game' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' : 'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400'
                              }`}>
                                {act.activityType === 'chat' ? <MessageCircle className="h-5 w-5" /> :
                                 act.activityType === 'game' ? <Gamepad2 className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                              </div>
                              <div>
                                <h5 className="font-semibold text-sm text-gray-805 dark:text-white">
                                  {act.activityType === 'chat' ? 'שיחת צ\'אט באנגלית' :
                                   act.activityType === 'game' ? `משחק: ${act.gameId || 'לא ידוע'}` : 'זירת שיחה'}
                                </h5>
                                <span className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {new Date(act.timestamp).toLocaleString('he-IL')}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-left">
                                <span className="text-[11px] text-gray-400 dark:text-gray-555 block font-semibold">זמן</span>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{act.timeSpent || 0} דק׳</span>
                              </div>
                              <div className="text-left">
                                <span className="text-[11px] text-gray-400 dark:text-gray-555 block font-semibold">הצלחה</span>
                                <span className={`text-xs font-bold ${act.successRate >= 80 ? 'text-green-600 dark:text-green-455' : act.successRate >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                  {act.successRate}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-850 flex justify-end">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-md text-sm cursor-pointer"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
