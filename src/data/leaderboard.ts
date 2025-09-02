// Leaderboard data and types
export interface LeaderboardUser {
  id: string;
  firstname: string;
  lastname: string;
  avatar: string | null;
  points: number;
  level_id: number;
  location: string;
  rank: number;
  rankChange: "up" | "down" | "same" | "new";
  rankChangeAmount?: number;
  weeklyPoints: number;
  achievements: string[];
  joinedDate: string;
  lastActive: string;
  isOnline: boolean;
}

export interface LeaderboardStats {
  totalUsers: number;
  weeklyActiveUsers: number;
  topPerformerThisWeek: string;
  averagePoints: number;
  yourPercentile: number;
}

// Production: all mock data removed. File now only exports types & rank-change helpers.

export const getRankChangeIcon = (change: string): string => {
  switch (change) {
    case "up":
      return "↑";
    case "down":
      return "↓";
    case "new":
      return "✨";
    default:
      return "−";
  }
};

export const getRankChangeColor = (change: string): string => {
  switch (change) {
    case "up":
      return "text-green-500";
    case "down":
      return "text-red-500";
    case "new":
      return "text-blue-500";
    default:
      return "text-gray-400";
  }
};
