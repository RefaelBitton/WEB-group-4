import React, { useState, useEffect } from 'react';
import { useUserStore } from '../data/userStore';
import { useNavigate } from 'react-router-dom';
import { getChildren, addChild, getChildReport } from '../logic/api';
import { LogOut, BookOpen, Star, Clock, Activity, X, TrendingUp, Award, MessageCircle, Gamepad2, Calendar, AlertCircle } from 'lucide-react';

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

  const loadChildrenData = async () => {
    try {
      const data = await getChildren(token);
      const childList = data.children || [];
      
      const enrichedChildren = await Promise.all(
        childList.map(async (child) => {
          try {
            const reportRes = await fetch(`/api/reports/progress/${child._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const report = reportRes.ok ? await reportRes.json() : null;

            const gameRes = await fetch(`/api/reports/gamification/${child._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const game = gameRes.ok ? await gameRes.json() : null;

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
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    loadChildrenData();
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
                <button 
                  onClick={() => handleOpenReport(child)}
                  className="w-full py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors"
                >
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

      {/* Report Modal Dialog */}
      {isReportModalOpen && selectedChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setIsReportModalOpen(false)} 
              className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-indigo-50/50">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-indigo-600" />
                דוח התקדמות עבור {selectedChild.name}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                רמת אנגלית: <span className="font-semibold text-indigo-600">{translateLevel(selectedChild.englishLevel)}</span> | גיל: {selectedChild.age || 'לא מוגדר'}
              </p>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {reportLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-500 font-semibold">טוען נתונים מהשרת...</span>
                </div>
              )}

              {reportError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3">
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
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 rounded-2xl border border-indigo-100/50">
                      <div className="flex justify-between items-start mb-2">
                        <Clock className="h-6 w-6 text-indigo-600" />
                        <span className="text-xs text-indigo-600 font-semibold bg-white px-2 py-0.5 rounded-full shadow-sm">דק׳</span>
                      </div>
                      <p className="text-xs text-gray-500 font-semibold">זמן תרגול כולל</p>
                      <h4 className="text-2xl font-black text-gray-900 mt-1">{reportData.timeSpent?.total || 0}</h4>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-2xl border border-green-100/50">
                      <div className="flex justify-between items-start mb-2">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                        <span className="text-xs text-green-600 font-semibold bg-white px-2 py-0.5 rounded-full shadow-sm">הצלחה</span>
                      </div>
                      <p className="text-xs text-gray-500 font-semibold">אחוז הצלחה</p>
                      <h4 className="text-2xl font-black text-gray-900 mt-1">{reportData.successRates?.overall || 0}%</h4>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-2xl border border-purple-100/50">
                      <div className="flex justify-between items-start mb-2">
                        <MessageCircle className="h-6 w-6 text-purple-600" />
                        <span className="text-xs text-purple-600 font-semibold bg-white px-2 py-0.5 rounded-full shadow-sm">צ'אט</span>
                      </div>
                      <p className="text-xs text-gray-500 font-semibold">הצלחה בצ'אט</p>
                      <h4 className="text-2xl font-black text-gray-900 mt-1">{reportData.successRates?.chat || 0}%</h4>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-2xl border border-amber-100/50">
                      <div className="flex justify-between items-start mb-2">
                        <Gamepad2 className="h-6 w-6 text-amber-600" />
                        <span className="text-xs text-amber-600 font-semibold bg-white px-2 py-0.5 rounded-full shadow-sm">משחקים</span>
                      </div>
                      <p className="text-xs text-gray-500 font-semibold">הצלחה במשחקים</p>
                      <h4 className="text-2xl font-black text-gray-900 mt-1">{reportData.successRates?.game || 0}%</h4>
                    </div>
                  </div>

                  {/* Time breakdown & Subjects */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Time Breakdown details */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-3 text-base flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-500" />
                        חלוקת זמן תרגול
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                            <span>שיחות צ'אט</span>
                            <span>{reportData.timeSpent?.breakdown?.chat || 0} דק׳</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-purple-500 h-full rounded-full" 
                              style={{ width: `${Math.min(100, ((reportData.timeSpent?.breakdown?.chat || 0) / (reportData.timeSpent?.total || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                            <span>משחקים לימודיים</span>
                            <span>{reportData.timeSpent?.breakdown?.game || 0} דק׳</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full" 
                              style={{ width: `${Math.min(100, ((reportData.timeSpent?.breakdown?.game || 0) / (reportData.timeSpent?.total || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                            <span>זירת שיחה (P2P)</span>
                            <span>{reportData.timeSpent?.breakdown?.arena || 0} דק׳</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500 h-full rounded-full" 
                              style={{ width: `${Math.min(100, ((reportData.timeSpent?.breakdown?.arena || 0) / (reportData.timeSpent?.total || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subjects Covered */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-3 text-base flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-500" />
                        נושאים ותחומי תרגול
                      </h4>
                      {(!reportData.subjectsCovered || reportData.subjectsCovered.length === 0) ? (
                        <p className="text-gray-500 text-xs italic text-center py-4">אין עדיין נושאים מתועדים</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {reportData.subjectsCovered.map((sub, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm">
                              <span className="font-bold text-indigo-600">{sub.subject}</span>
                              <span className="text-gray-400">({sub.count})</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Achievements section */}
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-bold text-gray-900 mb-4 text-base flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      הישגים וגביעים שנצברו ({reportData.achievements?.length || 0})
                    </h4>
                    {(!reportData.achievements || reportData.achievements.length === 0) ? (
                      <p className="text-gray-500 text-xs italic text-center py-6">אין עדיין הישגים מתועדים. המשיכו לתרגל כדי לזכות בגביעים!</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {reportData.achievements.map((ach, idx) => (
                          <div key={ach.id || idx} className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50/60 to-amber-100/10 rounded-2xl border border-amber-100/30 shadow-sm">
                            <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                              <Award className="h-6 w-6" />
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-gray-950">{ach.title}</h5>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{ach.description}</p>
                              <span className="inline-block mt-2 text-[10px] font-black text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                                +{ach.points} נקודות
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Activities timeline */}
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-bold text-gray-900 mb-4 text-base flex items-center gap-2">
                      <Activity className="h-5 w-5 text-indigo-500" />
                      יומן פעילות אחרון (עד 10 פעילויות)
                    </h4>
                    {(!reportData.recentActivities || reportData.recentActivities.length === 0) ? (
                      <p className="text-gray-500 text-xs italic text-center py-6">אין עדיין פעילויות מתועדות</p>
                    ) : (
                      <div className="space-y-3">
                        {reportData.recentActivities.map((act, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                                act.activityType === 'chat' ? 'bg-purple-100 text-purple-600' :
                                act.activityType === 'game' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                              }`}>
                                {act.activityType === 'chat' ? <MessageCircle className="h-5 w-5" /> :
                                 act.activityType === 'game' ? <Gamepad2 className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                              </div>
                              <div>
                                <h5 className="font-semibold text-sm text-gray-800">
                                  {act.activityType === 'chat' ? 'שיחת צ\'אט באנגלית' :
                                   act.activityType === 'game' ? `משחק: ${act.gameId || 'לא ידוע'}` : 'זירת שיחה'}
                                </h5>
                                <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {new Date(act.timestamp).toLocaleString('he-IL')}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-left">
                                <span className="text-[11px] text-gray-400 block font-semibold">זמן</span>
                                <span className="text-xs font-bold text-gray-700">{act.timeSpent || 0} דק׳</span>
                              </div>
                              <div className="text-left">
                                <span className="text-[11px] text-gray-400 block font-semibold">הצלחה</span>
                                <span className={`text-xs font-bold ${act.successRate >= 80 ? 'text-green-600' : act.successRate >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
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
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-md text-sm"
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
