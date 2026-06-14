const BOT_API = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/bot";

export async function sendMessageToBot(message, history = []) {
  const response = await fetch(`${BOT_API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  return response.json();
}

export async function getConversationStarter() {
  const response = await fetch(`${BOT_API}/starter`);
  return response.json();
}

export async function transcribeAudio(audioBlob) {
  const response = await fetch(`${BOT_API}/transcribe`, {
    method: "POST",
    headers: { "Content-Type": audioBlob.type || "audio/webm" },
    body: audioBlob,
  });
  return response.json();
}
