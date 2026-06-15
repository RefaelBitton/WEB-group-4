# User Auth and Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement and integrate the parent/child user schema, authentication endpoints, parent signup, child registration modal, and child login using local persistence.

**Architecture:** Use Single Collection Inheritance in MongoDB for Parent/Child. Front-end communicates via the API Gateway. Zustand stores JWT tokens persistently in `localStorage`.

**Tech Stack:** Express, Mongoose, React, Zustand, Node.js Test Runner.

---

### Task 1: User Service Integration Tests

**Files:**
- Create: `packages/user-service/test/auth.test.js`

- [ ] **Step 1: Write integration tests for registration and login**
  Write a test suite using Node's built-in test runner that tests:
  1. Parent Registration (`POST /parents/register`)
  2. Parent Login (`POST /parents/login`)
  3. Child Creation (`POST /children` with Bearer auth)
  4. Child Login (`POST /children/login`)
  5. Get Children (`GET /children` with Bearer auth)

  Create file [auth.test.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/user-service/test/auth.test.js):
  ```javascript
  import test from "node:test";
  import assert from "node:assert";
  import mongoose from "mongoose";
  import { createUserServiceApp } from "../src/app.js";

  const MONGO_TEST_URI = process.env.MONGO_URI || "mongodb://localhost:27017/english_learning_bot_test";

  test("User Auth and Management Flow", async (t) => {
    // 1. Setup DB Connection
    await mongoose.connect(MONGO_TEST_URI);
    await mongoose.connection.db.dropDatabase();

    // 2. Start Express app on dynamic port
    const app = createUserServiceApp();
    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api/users`;

    let parentToken = "";
    let childUsername = "childtest";

    await t.test("Register a parent successfully", async () => {
      const res = await fetch(`${baseUrl}/parents/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Parent Test",
          email: "parent@test.com",
          password: "password123",
        }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 201);
      assert.ok(data.accessToken);
      assert.strictEqual(data.user.role, "parent");
      assert.strictEqual(data.user.name, "Parent Test");
      parentToken = data.accessToken;
    });

    await t.test("Login a parent successfully", async () => {
      const res = await fetch(`${baseUrl}/parents/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "parent@test.com",
          password: "password123",
        }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.ok(data.accessToken);
    });

    await t.test("Create a child successfully under authenticated parent", async () => {
      const res = await fetch(`${baseUrl}/children`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${parentToken}`,
        },
        body: JSON.stringify({
          name: "Child Test",
          username: childUsername,
          pin: "1234",
          age: 8,
          englishLevel: "beginner",
        }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(data.user.role, "child");
      assert.strictEqual(data.user.username, childUsername);
    });

    await t.test("Login a child successfully", async () => {
      const res = await fetch(`${baseUrl}/children/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: childUsername,
          pin: "1234",
        }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.ok(data.accessToken);
      assert.strictEqual(data.user.role, "child");
    });

    await t.test("Get children list of parent", async () => {
      const res = await fetch(`${baseUrl}/children`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${parentToken}`,
        },
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(data.children));
      assert.strictEqual(data.children.length, 1);
      assert.strictEqual(data.children[0].username, childUsername);
    });

    // Teardown
    server.close();
    await mongoose.connection.close();
  });
  ```

- [ ] **Step 2: Run the test to verify user service routes**
  Run: `node --test packages/user-service/test/auth.test.js`
  Expected: All tests pass.

---

### Task 2: Update Frontend API Layer

**Files:**
- Modify: `packages/frontend/src/features/user/logic/api.js`

- [ ] **Step 1: Replace mocks with actual fetch requests in api.js**
  Update the frontend user API module to fetch from the gateway endpoints.

  Modify [api.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/user/logic/api.js):
  ```javascript
  const BASE_URL = '/api/users';

  export const registerParent = async ({ name, email, password }) => {
    const res = await fetch(`${BASE_URL}/parents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'שגיאה בהרשמה');
    }
    return res.json();
  };

  export const loginParent = async ({ email, password }) => {
    const res = await fetch(`${BASE_URL}/parents/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'שגיאה בהתחברות הורה');
    }
    return res.json();
  };

  export const loginChild = async ({ username, pin }) => {
    const res = await fetch(`${BASE_URL}/children/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pin }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'שגיאה בהתחברות תלמיד');
    }
    return res.json();
  };

  export const getChildren = async (token) => {
    const res = await fetch(`${BASE_URL}/children`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'שגיאה בטעינת ילדים');
    }
    return res.json();
  };

  export const addChild = async (childData, token) => {
    const res = await fetch(`${BASE_URL}/children`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(childData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'שגיאה בהוספת ילד');
    }
    return res.json();
  };
  ```

---

### Task 3: Persist Zustand Store

**Files:**
- Modify: `packages/frontend/src/features/user/data/userStore.js`

- [ ] **Step 1: Save and load authentication state to localStorage**
  Add persistence code to Zustand's `userStore.js`.

  Modify [userStore.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/user/data/userStore.js):
  ```javascript
  import { create } from 'zustand';

  const getStoredUser = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  };

  const getStoredToken = () => {
    return localStorage.getItem('token') || null;
  };

  export const useUserStore = create((set) => ({
    user: getStoredUser(),
    token: getStoredToken(),
    isLoading: false,
    error: null,
    
    setUser: (user, token) => {
      if (user && token) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      set({ user, token, error: null });
    },
    
    logout: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null, token: null });
    },
    
    setLoading: (isLoading) => set({ isLoading }),
    
    setError: (error) => set({ error }),
  }));
  ```

---

### Task 4: Dynamic Parent & Child Login UI

**Files:**
- Modify: `packages/frontend/src/features/user/presentation/Login.jsx`

- [ ] **Step 1: Update Login.jsx to toggle between Parent and Child login views**
  We will add an interactive Tab bar to toggle between parent and child login. We will bind the submit to `loginParent` / `loginChild` APIs.

  Modify [Login.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/user/presentation/Login.jsx):
  ```javascript
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
  ```

---

### Task 5: Parent Portal API Fetch & Add Child Modal

**Files:**
- Modify: `packages/frontend/src/features/user/presentation/ParentPortal.jsx`

- [ ] **Step 1: Refactor ParentPortal to dynamically display children and add children**
  Connect `ParentPortal` to the gateway APIs and render an interactive modal for child creation.

  Modify [ParentPortal.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/user/presentation/ParentPortal.jsx):
  ```javascript
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
  ```

- [ ] **Step 2: Connect the signup page to use the real parent registration API**
  Ensure `/signup` routes call the real `registerParent` API.

  Modify [Signup.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/user/presentation/Signup.jsx):
  ```javascript
  import React, { useState } from 'react';
  import { useUserStore } from '../data/userStore';
  import { registerParent } from '../logic/api';
  import { useNavigate, Link } from 'react-router-dom';
  import { User as UserIcon, Lock, Mail } from 'lucide-react';

  export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser, setLoading, setError, isLoading, error } = useUserStore();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
        const response = await registerParent({ name, email, password });
        setUser(response.user, response.accessToken);
        navigate('/portal');
      } catch (err) {
        setError(err.message || 'שגיאה בהרשמה. אנא נסה שוב.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-blue-50 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-600 mb-2">הרשמה</h1>
            <p className="text-gray-500">צרו חשבון הורה חדש</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">שם מלא</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
                  placeholder="הכנס שם מלא"
                  required
                />
              </div>
            </div>

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
                  className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
                  placeholder="הכנס דוא״ל"
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
                  className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"
                  placeholder="לפחות 6 תווים"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-700 transform transition-transform hover:-translate-y-0.5 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'יוצר חשבון...' : 'הרשמה'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-gray-600">
            כבר יש לכם חשבון? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">התחברו כאן</Link>
          </p>
        </div>
      </div>
    );
  }
  ```
