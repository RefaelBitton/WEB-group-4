import React, { useState } from 'react';
import { useUserStore } from '../data/userStore';
import { loginParent, loginChild } from '../logic/api';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';

export default function Login() {
  const [loginMode, setLoginMode] = useState('parent'); // 'parent' | 'child'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  
  const { setUser, setLoading, setError, isLoading, error } = useUserStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let response;
      if (loginMode === 'parent') {
        response = await loginParent({ email, password });
      } else {
        response = await loginChild({ username, pin });
      }
      
      setUser(response.user, response.accessToken);
      
      if (response.user.role === 'parent') {
        navigate('/portal');
      } else {
        navigate('/child');
      }
    } catch (err) {
      setError(err.message || 'שגיאה בהתחברות. אנא בדוק את הפרטים ונסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-blue-50 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">ברוכים הבאים</h1>
          <p className="text-gray-500">התחברו כדי להמשיך למסע הלמידה</p>
        </div>

        {/* Login Mode Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setLoginMode('parent'); setError(null); }}
            className={`flex-1 py-2 text-center font-semibold rounded-lg transition-colors ${loginMode === 'parent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            כניסת הורה
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode('child'); setError(null); }}
            className={`flex-1 py-2 text-center font-semibold rounded-lg transition-colors ${loginMode === 'child' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            כניסת ילד
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {loginMode === 'parent' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">דוא״ל</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900"
                    placeholder="parent@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">סיסמה</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900"
                    placeholder="הכנס סיסמה"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">שם משתמש של הילד</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 text-gray-900"
                    placeholder="שם משתמש ייחודי"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">קוד PIN (4 ספרות)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={pin}
                    maxLength={4}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 text-gray-900 text-left tracking-widest font-mono"
                    placeholder="••••"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-gradient-to-r ${loginMode === 'parent' ? 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : 'from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'} text-white font-bold rounded-xl shadow-lg transform transition-transform hover:-translate-y-0.5 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'מתחבר...' : 'התחברות'}
          </button>
        </form>
        
        {loginMode === 'parent' && (
          <p className="mt-8 text-center text-gray-600">
            אין לכם חשבון? <Link to="/signup" className="text-blue-600 font-semibold hover:underline">הירשמו כאן</Link>
          </p>
        )}
      </div>
    </div>
  );
}
