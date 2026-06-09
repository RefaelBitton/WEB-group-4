const GAME_API = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/games";

export async function fetchGameList() {
  const response = await fetch(`${GAME_API}/list`);
  return response.json();
}

export async function fetchGameSession(gameId) {
  // Placeholder mock for Tal to replace with real endpoint e.g., fetch(`${GAME_API}/${gameId}/session`)
  return Promise.resolve({
    id: `q-${Math.random().toString(36).substr(2, 9)}`,
    text: gameId === 'sentence-completion' 
      ? "The cat is sitting ___ the table." 
      : gameId === 'quick-translation' 
        ? "כלב" 
        : "",
    imageUrl: gameId === 'image-recognition' 
      ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
      : null,
    options: [
      { id: "opt1", text: gameId === 'sentence-completion' ? "on" : gameId === 'quick-translation' ? "Cat" : "Cat" },
      { id: "opt2", text: gameId === 'sentence-completion' ? "in" : gameId === 'quick-translation' ? "Dog" : "Dog" },
      { id: "opt3", text: gameId === 'sentence-completion' ? "under" : gameId === 'quick-translation' ? "Fish" : "Fish" },
      { id: "opt4", text: gameId === 'sentence-completion' ? "above" : gameId === 'quick-translation' ? "Bird" : "Bird" }
    ]
  });
}

export async function submitGameAnswer(gameId, payload) {
  const response = await fetch(`${GAME_API}/${gameId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

