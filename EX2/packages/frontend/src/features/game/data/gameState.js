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

  // Scoring and visual feedback states
  const [sessionScore, setSessionScore] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [correctOptionId, setCorrectOptionId] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [showPointsToast, setShowPointsToast] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [wrongAnswersCount, setWrongAnswersCount] = useState(0);

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
      setSessionScore(0);
      setSelectedOptionId(null);
      setCorrectOptionId(null);
      setIsAnswering(false);
      setShowPointsToast(false);
      setCorrectAnswersCount(0);
      setWrongAnswersCount(0);
      return;
    }
    const game = games.find((item) => item.id === gameId);
    setSelectedGame(game || { id: gameId, name: "משחק" });
    setGameFinished(false);
    setQuestionsPlayedCount(0);
    setSessionScore(0);
    setSelectedOptionId(null);
    setCorrectOptionId(null);
    setIsAnswering(false);
    setShowPointsToast(false);
    setCorrectAnswersCount(0);
    setWrongAnswersCount(0);
    await loadNextQuestion(gameId);
  }

  async function answerGame(gameId, payload) {
    setIsAnswering(true);
    setError(null);
    setSelectedOptionId(payload.answerId);
    try {
      const result = await submitGameAnswer(gameId, payload);
      
      const isCorrect = result.correct;
      const points = result.pointsEarned ?? 10;
      setCorrectOptionId(result.correctAnswerId);

      if (isCorrect) {
        setSessionScore((prev) => prev + points);
        setCorrectAnswersCount((prev) => prev + 1);
        setShowPointsToast(true);
      } else {
        setWrongAnswersCount((prev) => prev + 1);
      }

      const newCount = questionsPlayedCount + 1;

      // Hold screen to display feedback before advancing
      setTimeout(async () => {
        setShowPointsToast(false);
        setSelectedOptionId(null);
        setCorrectOptionId(null);
        setIsAnswering(false);
        setQuestionsPlayedCount(newCount);

        if (newCount >= 10) {
          // Complete the game session!
          setGameFinished(true);
          setCurrentQuestion(null);

          // Award gamification points for game completion
          const currentChildId = useUserStore.getState().user?._id;
          if (currentChildId) {
            await useGamificationStore.getState().triggerAward(currentChildId, "game_completed");

            // Keep track of completed games in the session to award VOCABULARY_EXPLORER
            const completedCount = parseInt(localStorage.getItem("completed_games_count") || "0") + 1;
            localStorage.setItem("completed_games_count", completedCount.toString());
            if (completedCount === 3) {
              await useGamificationStore.getState().triggerAward(currentChildId, "three_games_completed");
            }
          }
        } else {
          // Automatically load the next question after answering
          await loadNextQuestion(gameId);
        }
      }, 1500);

      return result;
    } catch (err) {
      setError("שגיאה בשליחת תשובה. נסה שוב.");
      setTimeout(async () => {
        setSelectedOptionId(null);
        setCorrectOptionId(null);
        setIsAnswering(false);
        await loadNextQuestion(gameId);
      }, 1500);
      return null;
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
    sessionScore,
    selectedOptionId,
    correctOptionId,
    isAnswering,
    showPointsToast,
    correctAnswersCount,
    wrongAnswersCount,
  };
}
