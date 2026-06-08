import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/user/presentation/Login';
import Signup from './features/user/presentation/Signup';
import ParentPortal from './features/user/presentation/ParentPortal';
import ChildDashboard from './features/user/presentation/ChildDashboard';
import { BotChat } from './features/bot/presentation/BotChat';

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

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/portal" element={<ParentPortal />} />
          <Route path="/child" element={<ChildDashboard />} />
          <Route path="/bot" element={<BotChat />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
