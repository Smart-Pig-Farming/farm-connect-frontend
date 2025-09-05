// Score & Leaderboard API client
// Uses cookie-based auth; ensure your fetch calls include credentials when needed.

export interface ApiLeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  points: number; // normalized
}

export interface MyScoreResponse {
  totalPoints: number;
  level: number;
  levelLabel: string;
  nextLevelAt: number | null;
  prestige: string | null;
  prestigeProgress?: any;
  modApprovals: number;
  streak: { current: number; best: number };
}

function normalizePoints(raw: number): number {
  // Backend currently returns scaled integers (x1000). Detect & convert.
  if (raw > 5000) return Math.round(raw / 1000);
  return raw;
}

export async function fetchLeaderboard(
  period: "daily" | "weekly" | "monthly"
): Promise<ApiLeaderboardEntry[]> {
  const res = await fetch(`/api/score/leaderboard?period=${period}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Leaderboard fetch failed (${res.status})`);
  const json = await res.json();
  if (!json.success) throw new Error("Leaderboard response not successful");
  return (json.data as any[]).map((r) => ({
    rank: r.rank,
    user_id: r.user_id,
    username: r.username,
    points: normalizePoints(r.points),
  }));
}

export async function fetchMyScore(): Promise<MyScoreResponse> {
  const res = await fetch("/api/score/me", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch my score");
  const json = await res.json();
  if (!json.success) throw new Error("Score response not successful");
  return json.data as MyScoreResponse;
}

export async function promoteModerator(userId: number): Promise<boolean> {
  const res = await fetch("/api/score/admin/promote-moderator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Promotion failed");
  const json = await res.json();
  return !!json.success;
}

export async function adminAdjust(
  userId: number,
  delta: number,
  reason?: string
): Promise<boolean> {
  const res = await fetch("/api/score/admin/adjust", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userId, delta, reason }),
  });
  if (!res.ok) throw new Error("Adjust failed");
  const json = await res.json();
  return !!json.success;
}
