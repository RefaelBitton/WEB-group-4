const GAME_API = import.meta.env.VITE_API_URL ?? "/api/games";

export async function fetchGameList() {
  const response = await fetch(`${GAME_API}/list`);
  if (!response.ok) throw new Error("Failed to fetch game list");
  return response.json();
}

export async function fetchGameSession(gameId) {
  const response = await fetch(`${GAME_API}/${gameId}/session`);
  if (!response.ok) throw new Error("Failed to fetch game session");
  return response.json();
}

export async function submitGameAnswer(gameId, payload) {
  const response = await fetch(`${GAME_API}/${gameId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to submit game answer");
  return response.json();
}

