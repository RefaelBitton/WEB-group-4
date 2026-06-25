# Dark Mode and Mobile Responsiveness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a manual Dark Mode toggle and complete mobile viewport responsiveness across the site, using a floating action button and a bottom navigation bar.

**Architecture:** We use a localStorage-backed theme hook that updates the HTML `.dark` class, configure Tailwind v4 to support class-based dark mode, and build a custom mobile-only bottom navigation bar to replace standard nav bars on mobile screens.

**Tech Stack:** React, Tailwind CSS v4, Lucide React, LocalStorage.

---

### Task 1: Dark Mode Configuration & CSS Setup

**Files:**
- Modify: `EX2/packages/frontend/index.html`
- Modify: `EX2/packages/frontend/src/style.css`

- [ ] **Step 1: Declare supported schemes in HTML**
  Add `<meta name="color-scheme" content="light dark">` and the inline dark mode initializer script in the `<head>` of `EX2/packages/frontend/index.html`.
  
  Code to add inside `<head>`:
  ```html
  <meta name="color-scheme" content="light dark">
  <script>
    (function() {
      const savedTheme = localStorage.getItem('theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  </script>
  ```

- [ ] **Step 2: Add Tailwind v4 Class-based variant and root variables in CSS**
  Update `EX2/packages/frontend/src/style.css` to define the `@variant dark` variant and override the root color variables under the `.dark` class.
  
  Code to replace in `:root` and `@media (prefers-color-scheme: dark)`:
  ```css
  @variant dark (&:where(.dark, .dark *));

  :root {
    --text: #6b6375;
    --text-h: #08060d;
    --bg: #fff;
    --border: #e5e4e7;
    --code-bg: #f4f3ec;
    --accent: #aa3bff;
    --accent-bg: rgba(170, 59, 255, 0.1);
    --accent-border: rgba(170, 59, 255, 0.5);
    --social-bg: rgba(244, 243, 236, 0.5);
    --shadow:
      rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

    --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
    --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
    --mono: ui-monospace, Consolas, monospace;

    font: 18px/145% var(--sans);
    letter-spacing: 0;
    color-scheme: light dark;
    color: var(--text);
    background: var(--bg);
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    @media (max-width: 1024px) {
      font-size: 16px;
    }
  }

  .dark {
    --text: #9ca3af;
    --text-h: #f3f4f6;
    --bg: #16171d;
    --border: #2e303a;
    --code-bg: #1f2028;
    --accent: #c084fc;
    --accent-bg: rgba(192, 132, 252, 0.15);
    --accent-border: rgba(192, 132, 252, 0.5);
    --social-bg: rgba(47, 48, 58, 0.5);
    --shadow:
      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
  }
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add EX2/packages/frontend/index.html EX2/packages/frontend/src/style.css
  git commit -m "feat: configure class-based dark mode settings in html and css"
  ```

---

### Task 2: Floating ThemeToggle Component

**Files:**
- Create: `EX2/packages/frontend/src/components/ThemeToggle.jsx`
- Modify: `EX2/packages/frontend/src/App.jsx`

- [ ] **Step 1: Create the floating theme toggle component**
  Write the React code for the theme toggle button inside `EX2/packages/frontend/src/components/ThemeToggle.jsx`.
  
  Code for `ThemeToggle.jsx`:
  ```javascript
  import React, { useState, useEffect } from 'react';
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
        className="fixed bottom-6 left-6 z-50 p-4 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center border border-indigo-500/20"
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? <Sun className="w-6 h-6 text-yellow-300" /> : <Moon className="w-6 h-6 text-indigo-100" />}
      </button>
    );
  }
  ```

- [ ] **Step 2: Add ThemeToggle globally in App.jsx**
  Import and render `<ThemeToggle />` inside `App.jsx` within the router context.
  
  Modify `EX2/packages/frontend/src/App.jsx` lines 55-74:
  ```javascript
  import ThemeToggle from './components/ThemeToggle';

  export default function App() {
    return (
      <ErrorBoundary>
        <BrowserRouter>
          <GlobalMilestoneNotifier />
          <ThemeToggle />
          <Routes>
            ...
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    );
  }
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add EX2/packages/frontend/src/components/ThemeToggle.jsx EX2/packages/frontend/src/App.jsx
  git commit -m "feat: add floating theme toggle button globally in App"
  ```

---

### Task 3: Mobile Bottom Navigation Bar Component

**Files:**
- Create: `EX2/packages/frontend/src/components/BottomNavBar.jsx`
- Modify: `EX2/packages/frontend/src/App.jsx`

- [ ] **Step 1: Create the BottomNavBar component**
  Write the React code for `EX2/packages/frontend/src/components/BottomNavBar.jsx` that is visible only on screen sizes below `768px`.
  
  Code for `BottomNavBar.jsx`:
  ```javascript
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
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-xl md:hidden px-4 py-2 flex justify-around items-center">
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
              <Icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs">התנתק</span>
        </button>
      </div>
    );
  }
  ```

- [ ] **Step 2: Add BottomNavBar globally in App.jsx**
  Import and render `<BottomNavBar />` inside `App.jsx`.
  
  Modify `EX2/packages/frontend/src/App.jsx`:
  ```javascript
  import BottomNavBar from './components/BottomNavBar';

  // render under BrowserRouter alongside ThemeToggle:
  <BrowserRouter>
    <GlobalMilestoneNotifier />
    <ThemeToggle />
    <BottomNavBar />
    ...
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add EX2/packages/frontend/src/components/BottomNavBar.jsx EX2/packages/frontend/src/App.jsx
  git commit -m "feat: add mobile bottom navigation bar component"
  ```

---

### Task 4: Responsive & Dark Mode styling for Login & Signup

**Files:**
- Modify: `EX2/packages/frontend/src/features/user/presentation/Login.jsx`
- Modify: `EX2/packages/frontend/src/features/user/presentation/Signup.jsx`

- [ ] **Step 1: Add responsiveness and dark mode classes in Login.jsx**
  Update styling classes in `EX2/packages/frontend/src/features/user/presentation/Login.jsx`.
  Replace line 44 background and main wrapper classes, card classes, headers, tab bars, inputs, labels, and text colors.
  
  Target Changes:
  - Outer container: `bg-blue-50 dark:bg-slate-950`
  - Card container: `bg-white dark:bg-slate-900 border dark:border-slate-800`
  - Headers: `text-blue-600 dark:text-blue-400`, `text-gray-500 dark:text-gray-400`, `text-slate-800 dark:text-slate-200`
  - Mode tabs container: `bg-gray-100 dark:bg-slate-800`
  - Mode tabs active: `bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400`
  - Labels: `text-gray-700 dark:text-gray-300`
  - Inputs: `bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-blue-500`

- [ ] **Step 2: Add responsiveness and dark mode classes in Signup.jsx**
  Update styling classes in `EX2/packages/frontend/src/features/user/presentation/Signup.jsx` similarly.
  
  Target Changes:
  - Outer container: `bg-blue-50 dark:bg-slate-950`
  - Card container: `bg-white dark:bg-slate-900 border dark:border-slate-800`
  - Headers: `text-indigo-600 dark:text-indigo-400`, `text-gray-500 dark:text-gray-400`
  - Labels: `text-gray-700 dark:text-gray-300`
  - Inputs: `bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white`

- [ ] **Step 3: Commit**
  ```bash
  git add EX2/packages/frontend/src/features/user/presentation/Login.jsx EX2/packages/frontend/src/features/user/presentation/Signup.jsx
  git commit -m "style: add dark mode and responsive layout styles to login and signup pages"
  ```

---

### Task 5: Responsive & Dark Mode styling for ChildDashboard

**Files:**
- Modify: `EX2/packages/frontend/src/features/user/presentation/ChildDashboard.jsx`

- [ ] **Step 1: Update dashboard styling**
  Modify styling in `EX2/packages/frontend/src/features/user/presentation/ChildDashboard.jsx` to make the menu responsive (grid layout) and look premium in dark mode.
  - Set main outer container padding: `p-6 pb-24 md:pb-6` (to avoid overlapping the bottom nav bar on mobile).
  - Background elements: `from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20`
  - Floating blobs opacity adjustment in dark mode.
  - Buttons grid layout: `grid-cols-1 md:grid-cols-2 gap-6 md:gap-8` (stacks on mobile).
  - Cards style: `bg-white/80 dark:bg-slate-900/80 border-indigo-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/20`
  - Hide standard logout button on mobile screens using `hidden md:flex` class.

- [ ] **Step 2: Commit**
  ```bash
  git add EX2/packages/frontend/src/features/user/presentation/ChildDashboard.jsx
  git commit -m "style: optimize child dashboard layout grid and theme support"
  ```

---

### Task 6: Responsive & Dark Mode styling for ParentPortal

**Files:**
- Modify: `EX2/packages/frontend/src/features/user/presentation/ParentPortal.jsx`

- [ ] **Step 1: Update portal theme and layout**
  Update `EX2/packages/frontend/src/features/user/presentation/ParentPortal.jsx` to support dark mode and mobile-responsive overlays.
  - Navigation bar: `bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white`
  - Main background: `bg-gray-50 dark:bg-slate-950`
  - Cards grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - Card styles: `bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800`
  - text elements: `text-gray-900 dark:text-white`, `text-gray-600 dark:text-gray-400`
  - Add Child modal: `bg-white dark:bg-slate-900 text-gray-900 dark:text-white`
  - Add Child modal inputs: `bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white`
  - Report modal background and text changes.

- [ ] **Step 2: Commit**
  ```bash
  git add EX2/packages/frontend/src/features/user/presentation/ParentPortal.jsx
  git commit -m "style: support dark mode and responsive report overlays in ParentPortal"
  ```

---

### Task 7: Responsive & Dark Mode styling for BotChat

**Files:**
- Modify: `EX2/packages/frontend/src/features/bot/presentation/BotChat.jsx`

- [ ] **Step 1: Optimize chatbot interface for mobile and dark mode**
  Update styling in `EX2/packages/frontend/src/features/bot/presentation/BotChat.jsx`.
  - Main background: `from-indigo-100 via-slate-50 to-purple-100 dark:from-indigo-950/20 dark:via-slate-950 dark:to-purple-950/20`
  - Chat section container: add `pb-20 md:pb-0` if mobile navigation overlays, or adjust `h-[75vh] md:h-[75vh]`
  - Section wrapper: `bg-white/60 dark:bg-slate-900/60 border-white/50 dark:border-slate-800`
  - Bot messages: `bg-white dark:bg-slate-850 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200`
  - Chat input area: `bg-white/80 dark:bg-slate-900/80 border-t border-white/50 dark:border-slate-800`
  - Input textarea wrapper: `bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700`
  - Textarea text color: `text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500`

- [ ] **Step 2: Commit**
  ```bash
  git add EX2/packages/frontend/src/features/bot/presentation/BotChat.jsx
  git commit -m "style: configure dark theme and keyboard-responsive design for BotChat"
  ```

---

### Task 8: Responsive & Dark Mode styling for GameHub

**Files:**
- Modify: `EX2/packages/frontend/src/features/game/presentation/GameHub.jsx`

- [ ] **Step 1: Update GameHub layouts**
  Update styling classes in `EX2/packages/frontend/src/features/game/presentation/GameHub.jsx`.
  - Main outer wrapper padding: `p-6 pb-24 md:p-12` (to keep space for mobile bottom bar).
  - Background: `bg-slate-50 dark:bg-slate-950`
  - Cards container & Game finishing screens: `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white`
  - Stat panels: `bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700`
  - Game selection buttons: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`
  - Selection button style: `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/20`

- [ ] **Step 2: Commit**
  ```bash
  git add EX2/packages/frontend/src/features/game/presentation/GameHub.jsx
  git commit -m "style: style game hub views and options for dark mode and mobile viewports"
  ```

---

### Task 9: Responsive & Dark Mode styling for GrammarHeroProfile

**Files:**
- Modify: `EX2/packages/frontend/src/features/gamification/presentation/GrammarHeroProfile.jsx`

- [ ] **Step 1: Configure dark mode and mobile grids for GrammarHeroProfile**
  Update styling classes in `EX2/packages/frontend/src/features/gamification/presentation/GrammarHeroProfile.jsx`.
  - Main outer container padding: `p-6 pb-24 md:p-12`
  - Background: `bg-slate-50 dark:bg-slate-950`
  - Dashboard stats cards: `bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200`
  - Achievements sub-cards: `bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200`
  - Achievement badge unlocked: `bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900`
  - Unlocked badge texts: `text-slate-800 dark:text-slate-100`, unlocked status label `bg-amber-200 dark:bg-amber-950 text-amber-800 dark:text-amber-300`

- [ ] **Step 2: Commit**
  ```bash
  git add EX2/packages/frontend/src/features/gamification/presentation/GrammarHeroProfile.jsx
  git commit -m "style: enable mobile grid wrapping and dark theme values for GrammarHeroProfile"
  ```

---

### Task 10: Responsive & Dark Mode styling for EnglishArena

**Files:**
- Modify: `EX2/packages/frontend/src/features/arena/presentation/EnglishArena.jsx`

- [ ] **Step 1: Style the Arena screen for responsiveness and dark mode**
  Update styling classes in `EX2/packages/frontend/src/features/arena/presentation/EnglishArena.jsx`.
  - Main outer container padding: `p-6 pb-24 md:p-12`
  - Background: `bg-slate-50 dark:bg-slate-950`
  - Page header title: `text-slate-900 dark:text-white`
  - Back button link: `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350`
  - Room selectors and call statuses cards: `bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200`
  - Private room inputs: `bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200`

- [ ] **Step 2: Commit**
  ```bash
  git add EX2/packages/frontend/src/features/arena/presentation/EnglishArena.jsx
  git commit -m "style: optimize EnglishArena voices and card layouts for responsive viewports and dark theme"
  ```

---

### Task 11: Validation and Verification

**Files:**
- None

- [ ] **Step 1: Build the frontend codebase**
  Run build to make sure there are no syntax/compile errors from any layout changes.
  Run: `npm run build` inside `EX2/packages/frontend`
  Expected: Success without errors.

- [ ] **Step 2: Run dev server**
  Launch the development server to check the UI.
  Run: `npm run dev` inside `EX2/packages/frontend`
  Expected: Dev server runs and shows output.
