import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/user/presentation/Login';
import Signup from './features/user/presentation/Signup';
import ParentPortal from './features/user/presentation/ParentPortal';
import ChildDashboard from './features/user/presentation/ChildDashboard';
import { BotChat } from './features/bot/presentation/BotChat';
import { GameHub } from './features/game/presentation/GameHub';
import GrammarHeroProfile from './features/gamification/presentation/GrammarHeroProfile';
import EnglishArena from './features/arena/presentation/EnglishArena';

import { useUserStore } from './features/user/data/userStore';
import { useGamificationStore } from './features/gamification/data/gamificationStore';
import MilestoneToast from './features/gamification/presentation/MilestoneToast';

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
        <div style={{ padding: '20px', color: 'red', direction: 'ltr' }}>
          <h2>Something went wrong.</h2>
          <pre>{this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function GlobalMilestoneNotifier() {
  const { user } = useUserStore();
  const { milestonePopup, clearMilestonePopup, initSocket, disconnectSocket } = useGamificationStore();

  useEffect(() => {
    if (user?._id && user.role === "child") {
      initSocket(user._id);
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [user?._id, user?.role, initSocket, disconnectSocket]);

  return <MilestoneToast popup={milestonePopup} onClose={clearMilestonePopup} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <GlobalMilestoneNotifier />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/portal" element={<ParentPortal />} />
          <Route path="/child" element={<ChildDashboard />} />
          <Route path="/bot" element={<BotChat />} />
          <Route path="/games" element={<GameHub />} />
          <Route path="/grammar-hero" element={<GrammarHeroProfile />} />
          <Route path="/arena" element={<EnglishArena />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
