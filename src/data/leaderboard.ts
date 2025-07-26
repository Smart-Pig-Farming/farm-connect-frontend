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
  postsCount: number;
  repliesCount: number;
  upvotesReceived: number;
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

// Mock current user ID - should match the one from posts.ts
const CURRENT_USER_ID = "user1";

// Generate mock leaderboard data
export const mockLeaderboardUsers: LeaderboardUser[] = [
  {
    id: "leader1",
    firstname: "Alice",
    lastname: "Mugisha",
    avatar: null,
    points: 2850,
    level_id: 5,
    location: "Kigali, Rwanda",
    rank: 1,
    rankChange: "same",
    rankChangeAmount: 0,
    postsCount: 45,
    repliesCount: 128,
    upvotesReceived: 324,
    weeklyPoints: 145,
    achievements: ["Top Contributor", "Knowledge Sharer", "Community Helper"],
    joinedDate: "2024-01-15",
    lastActive: "2h ago",
    isOnline: true,
  },
  {
    id: "leader2",
    firstname: "Jean",
    lastname: "Nkurunziza",
    avatar: null,
    points: 2720,
    level_id: 5,
    location: "Musanze, Rwanda",
    rank: 2,
    rankChange: "up",
    rankChangeAmount: 1,
    postsCount: 38,
    repliesCount: 156,
    upvotesReceived: 298,
    weeklyPoints: 132,
    achievements: ["Market Expert", "Problem Solver"],
    joinedDate: "2024-02-03",
    lastActive: "1h ago",
    isOnline: true,
  },
  {
    id: "leader3",
    firstname: "Grace",
    lastname: "Uwimana",
    avatar: null,
    points: 2650,
    level_id: 4,
    location: "Huye, Rwanda",
    rank: 3,
    rankChange: "down",
    rankChangeAmount: 1,
    postsCount: 52,
    repliesCount: 89,
    upvotesReceived: 267,
    weeklyPoints: 98,
    achievements: ["Discussion Starter", "Quality Poster"],
    joinedDate: "2023-11-20",
    lastActive: "30m ago",
    isOnline: true,
  },
  {
    id: "leader4",
    firstname: "Emmanuel",
    lastname: "Habimana",
    avatar: null,
    points: 2480,
    level_id: 4,
    location: "Nyagatare, Rwanda",
    rank: 4,
    rankChange: "up",
    rankChangeAmount: 2,
    postsCount: 31,
    repliesCount: 145,
    upvotesReceived: 234,
    weeklyPoints: 156,
    achievements: ["Rising Star", "Helpful Farmer"],
    joinedDate: "2024-03-10",
    lastActive: "4h ago",
    isOnline: false,
  },
  {
    id: "leader5",
    firstname: "Sarah",
    lastname: "Mukamana",
    avatar: null,
    points: 2390,
    level_id: 4,
    location: "Rubavu, Rwanda",
    rank: 5,
    rankChange: "same",
    rankChangeAmount: 0,
    postsCount: 29,
    repliesCount: 167,
    upvotesReceived: 201,
    weeklyPoints: 87,
    achievements: ["Supporter", "Community Builder"],
    joinedDate: "2024-01-28",
    lastActive: "1d ago",
    isOnline: false,
  },
  {
    id: "leader6",
    firstname: "David",
    lastname: "Nsengimana",
    avatar: null,
    points: 2280,
    level_id: 3,
    location: "Kayonza, Rwanda",
    rank: 6,
    rankChange: "up",
    rankChangeAmount: 3,
    postsCount: 25,
    repliesCount: 134,
    upvotesReceived: 189,
    weeklyPoints: 124,
    achievements: ["Tech Savvy", "Innovation Driver"],
    joinedDate: "2024-04-05",
    lastActive: "6h ago",
    isOnline: false,
  },
  {
    id: "leader7",
    firstname: "Marie",
    lastname: "Nyirahabimana",
    avatar: null,
    points: 2150,
    level_id: 3,
    location: "Rwamagana, Rwanda",
    rank: 7,
    rankChange: "down",
    rankChangeAmount: 2,
    postsCount: 33,
    repliesCount: 98,
    upvotesReceived: 176,
    weeklyPoints: 76,
    achievements: ["Consistent Contributor"],
    joinedDate: "2023-12-15",
    lastActive: "2d ago",
    isOnline: false,
  },
  {
    id: "leader8",
    firstname: "Paul",
    lastname: "Rwigema",
    avatar: null,
    points: 2050,
    level_id: 3,
    location: "Gatsibo, Rwanda",
    rank: 8,
    rankChange: "same",
    rankChangeAmount: 0,
    postsCount: 22,
    repliesCount: 112,
    upvotesReceived: 145,
    weeklyPoints: 92,
    achievements: ["Market Specialist"],
    joinedDate: "2024-02-20",
    lastActive: "12h ago",
    isOnline: false,
  },
  {
    id: "leader9",
    firstname: "Claudine",
    lastname: "Uwizeye",
    avatar: null,
    points: 1980,
    level_id: 3,
    location: "Nyanza, Rwanda",
    rank: 9,
    rankChange: "up",
    rankChangeAmount: 1,
    postsCount: 27,
    repliesCount: 89,
    upvotesReceived: 134,
    weeklyPoints: 103,
    achievements: ["Engagement Champion"],
    joinedDate: "2024-03-22",
    lastActive: "8h ago",
    isOnline: false,
  },
  {
    id: "leader10",
    firstname: "Patrick",
    lastname: "Niyonzima",
    avatar: null,
    points: 1890,
    level_id: 2,
    location: "Kirehe, Rwanda",
    rank: 10,
    rankChange: "down",
    rankChangeAmount: 1,
    postsCount: 19,
    repliesCount: 76,
    upvotesReceived: 112,
    weeklyPoints: 68,
    achievements: ["New Member Star"],
    joinedDate: "2024-05-10",
    lastActive: "1d ago",
    isOnline: false,
  },
  // Current user at rank 112
  {
    id: CURRENT_USER_ID,
    firstname: "John",
    lastname: "Doe",
    avatar: null,
    points: 890,
    level_id: 2,
    location: "Kigali, Rwanda",
    rank: 112,
    rankChange: "up",
    rankChangeAmount: 3,
    postsCount: 8,
    repliesCount: 23,
    upvotesReceived: 45,
    weeklyPoints: 34,
    achievements: ["Getting Started"],
    joinedDate: "2024-06-15",
    lastActive: "now",
    isOnline: true,
  },
];

// Generate additional users around current user's position
const generateUsersAroundRank = (centerRank: number): LeaderboardUser[] => {
  const users: LeaderboardUser[] = [];
  const startRank = Math.max(1, centerRank - 2);
  const endRank = centerRank + 2;

  for (let rank = startRank; rank <= endRank; rank++) {
    if (rank === 112) continue; // Skip current user as they're already in the main list

    const basePoints = 1000 - (rank - 100) * 5; // Points decrease as rank increases
    users.push({
      id: `user_${rank}`,
      firstname: `User${rank}`,
      lastname: "Farmer",
      avatar: null,
      points: Math.max(100, basePoints + Math.floor(Math.random() * 50)),
      level_id: rank < 50 ? 3 : rank < 100 ? 2 : 1,
      location: "Rwanda",
      rank,
      rankChange:
        Math.random() > 0.5 ? "up" : Math.random() > 0.3 ? "down" : "same",
      rankChangeAmount: Math.floor(Math.random() * 3),
      postsCount: Math.floor(Math.random() * 20) + 1,
      repliesCount: Math.floor(Math.random() * 50) + 5,
      upvotesReceived: Math.floor(Math.random() * 80) + 10,
      weeklyPoints: Math.floor(Math.random() * 40) + 5,
      achievements: ["Active Member"],
      joinedDate: "2024-06-01",
      lastActive: `${Math.floor(Math.random() * 48)}h ago`,
      isOnline: Math.random() > 0.7,
    });
  }

  return users;
};

export const usersAroundCurrentUser = generateUsersAroundRank(112);

export const mockLeaderboardStats: LeaderboardStats = {
  totalUsers: 1247,
  weeklyActiveUsers: 423,
  topPerformerThisWeek: "Emmanuel Habimana",
  averagePoints: 1340,
  yourPercentile: 25, // Current user is better than 25% of users
};

// Helper functions
export const getCurrentUserRank = (): LeaderboardUser | undefined => {
  return mockLeaderboardUsers.find((user) => user.id === CURRENT_USER_ID);
};

export const getTopUsers = (count: number = 10): LeaderboardUser[] => {
  return mockLeaderboardUsers.slice(0, count);
};

export const getUsersAroundRank = (rank: number): LeaderboardUser[] => {
  // In a real app, this would make an API call
  if (rank === 112) {
    return usersAroundCurrentUser;
  }
  return [];
};

export const getLevelName = (levelId: number): string => {
  const levels = {
    1: "Newcomer",
    2: "Growing Farmer",
    3: "Skilled Farmer",
    4: "Expert Farmer",
    5: "Master Farmer",
  };
  return levels[levelId as keyof typeof levels] || "Unknown";
};

export const getLevelColor = (levelId: number): string => {
  const colors = {
    1: "text-gray-600",
    2: "text-green-600",
    3: "text-blue-600",
    4: "text-purple-600",
    5: "text-orange-600",
  };
  return colors[levelId as keyof typeof colors] || "text-gray-600";
};

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
