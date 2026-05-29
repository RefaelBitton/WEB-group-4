const GAME_API = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/games";

export async function fetchGameList() {
  const response = await fetch(`${GAME_API}/list`);
  return response.json();
}

export async function submitGameAnswer(gameId, payload) {
  const response = await fetch(`${GAME_API}/${gameId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}
