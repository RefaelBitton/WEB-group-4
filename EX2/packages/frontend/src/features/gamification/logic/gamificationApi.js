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

export async function fetchLeaderboard() {
  const response = await fetch(`${API_BASE}/api/reports/gamification/leaderboard`);
  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }
  return response.json();
}

export async function fetchStoreItems() {
  const response = await fetch(`${API_BASE}/api/reports/gamification/store/items`);
  if (!response.ok) {
    throw new Error("Failed to fetch store items");
  }
  return response.json();
}

export async function buyStoreItem(userId, itemId) {
  const response = await fetch(`${API_BASE}/api/reports/gamification/store/buy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, itemId }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to buy item");
  }
  return response.json();
}

export async function equipStoreItem(userId, itemId, category) {
  const response = await fetch(`${API_BASE}/api/reports/gamification/store/equip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, itemId, category }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to equip item");
  }
  return response.json();
}

export async function fetchProgressionReport(userId) {
  const response = await fetch(`${API_BASE}/api/reports/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch progression report");
  }
  return response.json();
}
