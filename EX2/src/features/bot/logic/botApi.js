const BOT_API = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/bot";

export async function sendMessageToBot(message) {
  const response = await fetch(`${BOT_API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return response.json();
}

export async function getConversationStarter() {
  const response = await fetch(`${BOT_API}/starter`);
  return response.json();
}
