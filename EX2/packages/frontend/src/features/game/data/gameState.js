import { useEffect, useState } from "react";
import { fetchGameList, submitGameAnswer, fetchGameSession } from "../logic/gameApi.js";
import { useUserStore } from "../../user/data/userStore.js";
import { useGamificationStore } from "../../gamification/data/gamificationStore.js";

export function useGame() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Automatic Game Completion variables
  const [questionsPlayedCount, setQuestionsPlayedCount] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

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
      setGameFinished(false);
      setQuestionsPlayedCount(0);
      return;
    }
    const game = games.find((item) => item.id === gameId);
    setSelectedGame(game || { id: gameId, name: "משחק" });
    setGameFinished(false);
    setQuestionsPlayedCount(0);
    await loadNextQuestion(gameId);
  }

  async function answerGame(gameId, payload) {
    setLoading(true);
    setError(null);
    try {
      const result = await submitGameAnswer(gameId, payload);
      
      const newCount = questionsPlayedCount + 1;
      setQuestionsPlayedCount(newCount);

      if (newCount >= 5) {
        // Complete the game session!
        setGameFinished(true);
        setCurrentQuestion(null);

        // Award gamification points for game completion
        const currentChildId = useUserStore.getState().user?._id;
        if (currentChildId) {
          await useGamificationStore.getState().triggerAward(currentChildId, "game_completed");
        }
      } else {
        // Automatically load the next question after answering
        await loadNextQuestion(gameId);
      }
      return result;
    } catch (err) {
      setError("שגיאה בשליחת תשובה. נסה שוב.");
      // Automatically load the next question to prevent getting stuck on a stale question
      await loadNextQuestion(gameId);
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
    questionsPlayedCount,
    gameFinished,
    setGameFinished,
  };
}
