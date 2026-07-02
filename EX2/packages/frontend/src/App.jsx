import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/user/presentation/Login';
import Signup from './features/user/presentation/Signup';
import ParentPortal from './features/user/presentation/ParentPortal';
import ChildDashboard from './features/user/presentation/ChildDashboard';
const BotChat = lazy(() => import('./features/bot/presentation/BotChat').then(m => ({ default: m.BotChat })));
const GameHub = lazy(() => import('./features/game/presentation/GameHub').then(m => ({ default: m.GameHub })));
const GrammarHeroProfile = lazy(() => import('./features/gamification/presentation/GrammarHeroProfile'));
const EnglishArena = lazy(() => import('./features/arena/presentation/EnglishArena'));

import { useUserStore } from './features/user/data/userStore';
import { useGamificationStore } from './features/gamification/data/gamificationStore';
import MilestoneToast from './features/gamification/presentation/MilestoneToast';
import ThemeToggle from './components/ThemeToggle';
import BottomNavBar from './components/BottomNavBar';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', direction: 'rtl' }}>
          <h2>אירעה שגיאה. אנא רענן והודיעו למפתח.</h2>
          <pre>{this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function GlobalMilestoneNotifier() {
  const { user } = useUserStore();
  const { milestonePopup, clearMilestonePopup, initSocket, disconnectSocket, loadStats } = useGamificationStore();

  useEffect(() => {
    if (user?._id && user.role === "child") {
      loadStats(user._id);
      initSocket(user._id);
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [user?._id, user?.role, initSocket, disconnectSocket, loadStats]);

  return <MilestoneToast popup={milestonePopup} onClose={clearMilestonePopup} />;
}

function TrinketRenderer({ activeTrinkets, role }) {
  if (role !== "child" || !activeTrinkets || activeTrinkets.length === 0) return null;

  const showDragon = activeTrinkets.includes("pet-dragon");
  const showGhost = activeTrinkets.includes("friendly-ghost");
  const showSparkles = activeTrinkets.includes("sparkle-trail");
  const showSnowfall = activeTrinkets.includes("snowfall-effect");

  // Mouse Sparkle Trail Effect
  useEffect(() => {
    if (!showSparkles) return;

    const handleMouseMove = (e) => {
      const star = document.createElement("div");
      star.className = "fixed pointer-events-none select-none text-xl z-[9999] animate-fade-star";
      star.style.left = `${e.clientX}px`;
      star.style.top = `${e.clientY}px`;
      star.innerHTML = "✨";
      document.body.appendChild(star);
      
      setTimeout(() => {
        star.remove();
      }, 800);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [showSparkles]);

  // Snowfall Effect Flakes State
  const [snowflakes, setSnowflakes] = React.useState([]);
  useEffect(() => {
    if (!showSnowfall) return;

    const interval = setInterval(() => {
      setSnowflakes((prev) => [
        ...prev.slice(-25), // keep last 25 flakes max
        {
          id: Math.random(),
          left: `${Math.random() * 100}%`,
          delay: `${Math.random() * 2}s`,
          duration: `${6 + Math.random() * 6}s`,
          size: `${12 + Math.random() * 14}px`,
        },
      ]);
    }, 500);

    return () => clearInterval(interval);
  }, [showSnowfall]);

  return (
    <>
      {/* Floating Pet Dragon */}
      {showDragon && (
        <div 
          className="fixed bottom-24 left-6 z-[999] text-5xl pointer-events-none select-none"
          style={{ animation: "float-dragon 4s ease-in-out infinite" }}
        >
          🐉
        </div>
      )}

      {/* Floating Friendly Ghost */}
      {showGhost && (
        <div 
          className="fixed bottom-24 right-6 z-[999] text-5xl pointer-events-none select-none"
          style={{ animation: "float-ghost 3.5s ease-in-out infinite" }}
        >
          👻
        </div>
      )}

      {/* Falling Snowflakes */}
      {showSnowfall && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[998]">
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              className="absolute text-blue-200 dark:text-blue-900/40 opacity-70 animate-fall"
              style={{
                left: flake.left,
                fontSize: flake.size,
                animationDuration: flake.duration,
                top: "-30px"
              }}
            >
              ❄️
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AppLayout() {
  const { activeTheme, activeTrinkets } = useGamificationStore();
  const { user } = useUserStore();

  const isChild = user?.role === "child";
  const themeClass = isChild && activeTheme && activeTheme !== "default" ? `theme-${activeTheme}` : "";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClass}`}>
      <GlobalMilestoneNotifier />
      <ThemeToggle />
      <BottomNavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/portal" element={<ParentPortal />} />
        <Route path="/child" element={<ChildDashboard />} />
        <Route path="/bot" element={<Suspense fallback={<div dir="rtl">טוען שיחה...</div>}><BotChat /></Suspense>} />
        <Route path="/games" element={<Suspense fallback={<div dir="rtl">טוען משחקים...</div>}><GameHub /></Suspense>} />
        <Route path="/grammar-hero" element={<Suspense fallback={<div dir="rtl">טוען פרופיל...</div>}><GrammarHeroProfile /></Suspense>} />
        <Route path="/arena" element={<Suspense fallback={<div dir="rtl">טוען זירת תרגול...</div>}><EnglishArena /></Suspense>} />
      </Routes>
      <TrinketRenderer activeTrinkets={activeTrinkets} role={user?.role} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
