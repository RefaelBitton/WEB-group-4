import { useUserStore } from "../../user/data/userStore.js";

const GAME_API = import.meta.env.VITE_API_URL ?? "/api/games";

async function parseJsonResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Game API request failed");
  }

  return data;
}

function getHeaders(extraHeaders = {}) {
  const token = useUserStore.getState().token;
  const headers = { ...extraHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchGameList() {
  const response = await fetch(`${GAME_API}/list`, {
    headers: getHeaders(),
  });
  return parseJsonResponse(response);
}

export async function fetchGameSession(gameId) {
  const response = await fetch(`${GAME_API}/${gameId}/session`, {
    headers: getHeaders(),
  });
  return parseJsonResponse(response);
}

export async function submitGameAnswer(gameId, payload) {
  const response = await fetch(`${GAME_API}/${gameId}/answer`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}
