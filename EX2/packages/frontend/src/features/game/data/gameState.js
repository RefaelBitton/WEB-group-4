import { useEffect, useState } from "react";
import { fetchGameList, submitGameAnswer } from "../logic/gameApi.js";

export function useGame() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      try {
        const data = await fetchGameList();
        setGames(data?.games || []);
      } catch (err) {
        setError("לא ניתן לטעון משחקים כרגע.");
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  async function selectGame(gameId) {
    const game = games.find((item) => item.id === gameId);
    setSelectedGame(game || { id: gameId, name: "משחק" });
  }

  async function answerGame(gameId, payload) {
    setLoading(true);
    setError(null);
    try {
      return await submitGameAnswer(gameId, payload);
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
    selectGame,
    answerGame,
    loading,
    error,
  };
}
