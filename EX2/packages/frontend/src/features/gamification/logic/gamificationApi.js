const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function fetchGamificationStats(userId) {
  const response = await fetch(`${API_BASE}/api/reports/gamification/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch gamification stats");
  }
  return response.json();
}

export async function awardGamificationPoints(userId, eventType) {
  const response = await fetch(`${API_BASE}/api/reports/gamification/award`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, eventType }),
  });
  if (!response.ok) {
    throw new Error("Failed to award gamification points");
  }
  return response.json();
}
