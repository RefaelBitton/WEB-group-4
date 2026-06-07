import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { LearningStudio } from "./features/learning-studio/presentation/LearningStudio.jsx";
import { LoginPage } from "./features/user/presentation/LoginPage.jsx";
import { BotChat } from "./features/bot/presentation/BotChat.jsx";
import { GameHub } from "./features/game/presentation/GameHub.jsx";
import { UserProvider } from "./features/user/data/userState.js";

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-100 p-4" dir="rtl">
          <nav className="mb-4 flex gap-3 justify-end">
            <Link to="/login" className="text-indigo-600">כניסה</Link>
            <Link to="/learning" className="text-indigo-600">לימודים</Link>
            <Link to="/bot" className="text-indigo-600">צ'אט</Link>
            <Link to="/games" className="text-indigo-600">משחקים</Link>
          </nav>

          <main>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/learning" element={<LearningStudio />} />
              <Route path="/bot" element={<BotChat />} />
              <Route path="/games" element={<GameHub />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}
