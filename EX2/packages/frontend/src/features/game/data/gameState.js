import { useEffect, useState } from "react";
import { fetchGameList, submitGameAnswer, fetchGameSession } from "../logic/gameApi.js";

export function useGame() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      try {
        const data = await fetchGameList();
        setGames(data?.games || []);
      } catch (err) {
        setError("לא ניתן לטעון משחקים כרגע. בדוק את החיבור לשרת.");
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  async function loadNextQuestion(gameId) {
    setLoading(true);
    setError(null);
    try {
      const q = await fetchGameSession(gameId);
      setCurrentQuestion(q);
    } catch (err) {
      setError("שגיאה בטעינת השאלה. נסה שוב מאוחר יותר.");
    } finally {
      setLoading(false);
    }
  }

  async function selectGame(gameId) {
    if (!gameId) {
      setSelectedGame(null);
      setCurrentQuestion(null);
      return;
    }
    const game = games.find((item) => item.id === gameId);
    setSelectedGame(game || { id: gameId, name: "משחק" });
    await loadNextQuestion(gameId);
  }

  async function answerGame(gameId, payload) {
    setLoading(true);
    setError(null);
    try {
      const result = await submitGameAnswer(gameId, payload);
      
      // Automatically load the next question after answering
      await loadNextQuestion(gameId);
      return result;
    } catch (err) {
      setError("שגיאה בשליחת תשובה. נסה שוב.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    games,
    selectedGame,
    currentQuestion,
    selectGame,
    answerGame,
    loading,
    error,
  };
}
