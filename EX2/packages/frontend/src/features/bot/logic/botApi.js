import { useUserStore } from "../../user/data/userStore.js";

const BOT_API = import.meta.env.VITE_API_URL ?? "/api/bot";

function getHeaders(extraHeaders = {}) {
  const token = useUserStore.getState().token;
  const headers = { ...extraHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function sendMessageToBot(message, history = []) {
  const response = await fetch(`${BOT_API}/chat`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ message, history }),
  });
  return response.json();
}

export async function getConversationStarter() {
  const response = await fetch(`${BOT_API}/starter`, {
    headers: getHeaders(),
  });
  return response.json();
}

export async function transcribeAudio(audioBlob) {
  const response = await fetch(`${BOT_API}/transcribe`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": audioBlob.type || "audio/webm" }),
    body: audioBlob,
  });
  return response.json();
}

