import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import {
  Trophy,
  Medal,
  Award,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Star,
  MapPin,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
} from "lucide-react";
import {
  getRankChangeColor,
  type LeaderboardUser,
} from "../../data/leaderboard";
import { getLevelName, getLevelColor } from "@/lib/levels";
import {
  useGetLeaderboardQuery,
  useGetLeaderboardPaginatedQuery,
  useGetMyStatsQuery,
  useGetLeaderboardAroundQuery,
} from "../../store/api/scoreApi";
import { useAppSelector } from "@/store/hooks";

interface LeaderboardProps {
  onBackToDiscussions: () => void;
}

export function Leaderboard({ onBackToDiscussions }: LeaderboardProps) {
  const [showFullRankings, setShowFullRankings] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "day" | "week" | "month" | "all"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Map UI selected range to API period parameter
  const period =
    selectedTimeRange === "day"
      ? "daily"
      : selectedTimeRange === "week"
      ? "weekly"
      : selectedTimeRange === "month"
      ? "monthly"
      : "all"; // all-time

  // Simple top list (legacy) for top section
  const {
    data: liveLeaderboard,
    isLoading: simpleLoading,
    isError,
  } = useGetLeaderboardQuery({ period });
  // Paginated list for full rankings (search & paging)
  const { data: paginated, isLoading: paginatedLoading } =
    useGetLeaderboardPaginatedQuery({
      period,
      page: currentPage,
      limit: 20,
      search: searchQuery || undefined,
    });
  // Current user stats (rank & period points)
  const { data: myStats } = useGetMyStatsQuery({ period });
  const currentUserRank = myStats?.rank;
  const authUserId = useAppSelector((s) => s.auth.user?.id);
  // Around-user window (only if we know user id)
  const { data: aroundRows } = useGetLeaderboardAroundQuery(
    { period, userId: authUserId || 0, radius: 3 },
    { skip: !authUserId }
  );

  const mapEntry = (l: {
    user_id: number;
    username: string;
    firstname?: string;
    lastname?: string;
    rank: number;
    points: number;
    level_id?: number;
    district?: string | null;
    province?: string | null;
    sector?: string | null;
    location?: string;
  }): LeaderboardUser => {
    const firstname = (l.firstname && l.firstname.trim()) || l.username;
    const lastname = (l.lastname && l.lastname.trim()) || "";
    const computedLocation =
      l.location ||
      [l.sector, l.district, l.province].filter(Boolean).join(", ") ||
      "—";

    console.log("location: ", l);
    return {
      id: String(l.user_id),
      firstname,
      lastname,
      avatar: null,
      points: l.points,
      level_id: l.level_id ?? 0,
      location: computedLocation,
      rank: l.rank,
      rankChange: "same",
      weeklyPoints: 0,
      achievements: [],
      joinedDate: "",
      lastActive: "",
      isOnline: false,
    };
  };

  const baseRows = paginated?.rows || liveLeaderboard || [];
  // Pure live data only – no mock fallback. If fewer than 3 results we simply show an empty state.
  const topUsers: LeaderboardUser[] = baseRows.slice(0, 10).map(mapEntry);
  const hasMinimumTop = topUsers.length >= 3;

  const totalUsers = paginated?.meta.totalPeriodUsers ?? baseRows.length;
  const percentile =
    currentUserRank && totalUsers
      ? Math.max(1, Math.round((currentUserRank / totalUsers) * 100))
      : undefined;
  const stats = {
    totalUsers,
    yourPercentile: percentile,
  };
  const usersNearCurrent: LeaderboardUser[] = aroundRows
    ? aroundRows.map(mapEntry)
    : [];

  const currentRaw =
    baseRows.find((r) => authUserId && r.user_id === authUserId) ||
    (aroundRows
      ? aroundRows.find((r) => authUserId && r.user_id === authUserId)
      : undefined);
  const currentUser: LeaderboardUser | undefined = currentRaw
    ? mapEntry(currentRaw)
    : undefined;

  // Get podium users (top 3)
  const podiumUsers = topUsers.slice(0, 3);
  const otherTopUsers = topUsers.slice(3);

  // --- Podium meta calculations (leader margins & climb requirements) ---
  const leaderLead =
    podiumUsers.length >= 2
      ? Math.max(0, podiumUsers[0].points - podiumUsers[1].points)
      : 0;
  const secondNeeds =
    podiumUsers.length >= 2
      ? Math.max(0, podiumUsers[0].points - podiumUsers[1].points + 1)
      : 0;
  const thirdNeeds =
    podiumUsers.length >= 3
      ? Math.max(0, podiumUsers[1].points - podiumUsers[2].points + 1)
      : 0;

  const timeRangeLabel = (range: "day" | "week" | "month" | "all"): string =>
    range === "day"
      ? "Today"
      : range === "week"
      ? "This Week"
      : range === "month"
      ? "This Month"
      : "All Time";

  // Lightweight count-up hook (no extra lib) with reduced motion respect
  const useCountUp = (value: number, duration = 800) => {
    const [display, setDisplay] = useState(value);
    const startValueRef = useRef(value);
    const lastValueRef = useRef(value);
    useEffect(() => {
      // If value decreased or first render, reset baseline
      if (value < lastValueRef.current) startValueRef.current = value;
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced || value === lastValueRef.current) {
        setDisplay(value);
        lastValueRef.current = value;
        return;
      }
      const initial = lastValueRef.current;
      const delta = value - initial;
      const start = performance.now();
      let raf: number;
      const tick = (t: number) => {
        const elapsed = t - start;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        setDisplay(Math.round(initial + delta * eased));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      lastValueRef.current = value;
      return () => cancelAnimationFrame(raf);
    }, [value, duration]);
    return display;
  };

  // Dynamic podium heading copy variants per requirement
  const podiumHeading = useMemo(() => {
    switch (selectedTimeRange) {
      case "week":
        return "🏆 Weekly Champions"; // emoji only for weekly variant
      case "day":
        return "Today's Top Farmers";
      case "month":
        return "Monthly Champions";
      case "all":
      default:
        return "Top Farmers (All Time)";
    }
  }, [selectedTimeRange]);

  // Pagination: backend already pages; just map current page rows
  const totalPages = paginated ? paginated.meta.totalPages : 1;

  const getCurrentPageUsers = useMemo(() => {
    if (!showFullRankings) return [];
    const source = paginated
      ? paginated.rows.map(mapEntry)
      : liveLeaderboard && liveLeaderboard.length > 0
      ? liveLeaderboard.map(mapEntry)
      : [];
    if (!searchQuery) return source;
    const q = searchQuery.toLowerCase();
    return source.filter((user) => {
      const full = `${user.firstname} ${user.lastname}`.trim().toLowerCase();
      return (
        full.includes(q) ||
        user.firstname.toLowerCase().includes(q) ||
        user.lastname.toLowerCase().includes(q) ||
        user.location.toLowerCase().includes(q)
      );
    });
  }, [showFullRankings, paginated, liveLeaderboard, searchQuery]);

  const UserCard = ({
    user,
    rank,
    isCurrentUser = false,
    size = "normal",
  }: {
    user: LeaderboardUser;
    rank?: number;
    isCurrentUser?: boolean;
    size?: "small" | "normal" | "large";
  }) => {
    const cardSize =
      size === "large" ? "p-6" : size === "small" ? "p-3" : "p-4";
    const avatarSize =
      size === "large"
        ? "w-16 h-16"
        : size === "small"
        ? "w-8 h-8"
        : "w-12 h-12";
    const textSize =
      size === "large" ? "text-lg" : size === "small" ? "text-sm" : "text-base";

    return (
      <div
        className={`${cardSize} rounded-xl transition-all duration-300 ${
          isCurrentUser
            ? "bg-gradient-to-r from-orange-50/80 via-orange-25/60 to-amber-50/80 backdrop-blur-sm shadow-lg shadow-orange-100/60 hover:shadow-xl hover:shadow-orange-200/70 hover:-translate-y-0.5"
            : "bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:bg-white"
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="flex flex-col items-center min-w-[3rem]">
            <div
              className={`${textSize} font-bold ${
                isCurrentUser ? "text-orange-600" : "text-gray-700"
              }`}
            >
              #{rank || user.rank}
            </div>
            {user.rankChange !== "same" && (
              <div
                className={`text-xs flex items-center gap-1 ${getRankChangeColor(
                  user.rankChange
                )}`}
              >
                {user.rankChange === "up" && <TrendingUp className="w-3 h-3" />}
                {user.rankChange === "down" && (
                  <TrendingDown className="w-3 h-3" />
                )}
                {user.rankChange === "new" && <Sparkles className="w-3 h-3" />}
                {user.rankChangeAmount && user.rankChangeAmount > 0 && (
                  <span>{user.rankChangeAmount}</span>
                )}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className={`${avatarSize} relative`}>
            <div
              className={`${avatarSize} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold shadow-lg ${
                size === "large"
                  ? "text-xl shadow-orange-300/40"
                  : size === "small"
                  ? "text-xs shadow-orange-200/30"
                  : "text-sm shadow-orange-200/40"
              }`}
            >
              {user.firstname[0]}
              {user.lastname[0]}
            </div>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/40 ring-2 ring-white"></div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`${textSize} font-semibold text-gray-900 truncate`}
              >
                {user.firstname} {user.lastname}
              </h3>
              {isCurrentUser && (
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                  You
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {user.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {user.lastActive}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span
                className={`${getLevelColor(
                  user.level_id
                )} bg-white/80 px-2 py-1 rounded-full font-medium shadow-sm backdrop-blur-sm`}
              >
                {getLevelName(user.level_id)}
              </span>
              {user.achievements.slice(0, 2).map((achievement, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100/80 text-gray-700 px-2 py-1 rounded-full font-medium shadow-sm"
                >
                  {achievement}
                </span>
              ))}
            </div>
          </div>

          {/* Points */}
          <div className="text-right">
            <div className={`${textSize} font-bold text-gray-900`}>
              {user.points.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">points</div>
            {user.weeklyPoints > 0 && (
              <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />+{user.weeklyPoints} this week
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PodiumCard = ({
    user,
    position,
    context,
  }: {
    user: LeaderboardUser;
    position: 1 | 2 | 3;
    context?: { leadMargin?: number; pointsToNext?: number };
  }) => {
    const colors = {
      1: {
        bg: "from-yellow-400 to-yellow-600",
        icon: Trophy,
        shadow:
          "shadow-xl shadow-yellow-200/40 hover:shadow-2xl hover:shadow-yellow-300/50",
        cardBg: "bg-gradient-to-br from-yellow-50/90 via-white to-yellow-50/70",
      },
      2: {
        bg: "from-gray-400 to-gray-600",
        icon: Medal,
        shadow:
          "shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-gray-300/50",
        cardBg: "bg-gradient-to-br from-gray-50/90 via-white to-gray-50/70",
      },
      3: {
        bg: "from-amber-400 to-amber-600",
        icon: Award,
        shadow:
          "shadow-xl shadow-amber-200/40 hover:shadow-2xl hover:shadow-amber-300/50",
        cardBg: "bg-gradient-to-br from-amber-50/90 via-white to-amber-50/70",
      },
    };

    const { bg, icon: Icon, shadow, cardBg } = colors[position];
    const rankLabel = position === 1 ? "1st" : position === 2 ? "2nd" : "3rd";
    // Emphasize first place visually
    const scale =
      position === 1
        ? "scale-105 md:scale-110"
        : position === 2
        ? "scale-100"
        : "scale-100";
    const raise =
      position === 1 ? "md:-mt-4" : position === 2 ? "md:mt-2" : "md:mt-4"; // Subtle pedestal effect

    const subtitle =
      position === 1
        ? "Overall Leader"
        : position === 2
        ? "Runner-Up"
        : "Third Place";

    const animatedPoints = useCountUp(user.points);
    const periodText = timeRangeLabel(selectedTimeRange).toLowerCase();
    const deltaLine = (() => {
      if (position === 1) {
        if (context?.leadMargin && context.leadMargin > 0)
          return `Leading by ${context.leadMargin} pts`;
        return "Tied for 1st";
      }
      if (context?.pointsToNext === 0) return "Tied";
      if (context?.pointsToNext && context.pointsToNext > 0)
        return `Needs ${context.pointsToNext} pts to overtake`;
      return null;
    })();

    return (
      <div
        className={`relative p-6 text-center ${cardBg} backdrop-blur-sm rounded-2xl ${shadow} ${scale} ${raise} hover:scale-105 hover:-translate-y-2 transition-all duration-500`}
        aria-label={`${rankLabel} place: ${user.firstname} ${user.lastname}`}
      >
        {/* Rank badge */}
        <div className="absolute left-3 top-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1 shadow-md backdrop-blur-sm
            ${
              position === 1
                ? "bg-yellow-500/90 text-white ring-2 ring-yellow-300/70"
                : position === 2
                ? "bg-gray-500/90 text-white ring-2 ring-gray-300/60"
                : "bg-amber-600/90 text-white ring-2 ring-amber-300/60"
            }`}
          >
            <span>{rankLabel}</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          {/* Position Icon */}
          <div
            className={`w-20 h-20 rounded-full bg-gradient-to-br ${bg} flex items-center justify-center mb-4 shadow-xl ${
              position === 1
                ? "shadow-yellow-300/50"
                : position === 2
                ? "shadow-gray-300/50"
                : "shadow-amber-300/50"
            }`}
          >
            <Icon className="w-10 h-10 text-white" />
          </div>

          {/* Avatar */}
          <div
            className={`relative ${
              position === 1 ? "w-24 h-24" : "w-20 h-20"
            } mb-4`}
          >
            <div
              className={`rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-xl shadow-orange-300/40 ${
                position === 1 ? "w-24 h-24 text-2xl" : "w-20 h-20 text-xl"
              }`}
            >
              {user.firstname[0]}
              {user.lastname[0]}
            </div>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full shadow-lg shadow-green-500/40 ring-4 ring-white"></div>
            )}
          </div>

          {/* User Info */}
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {user.firstname} {user.lastname}
          </h3>
          <p className="text-xs font-medium text-gray-500 mb-3 tracking-wide uppercase">
            {subtitle}
          </p>

          <p className="text-sm text-gray-600 mb-4 flex items-center gap-1 justify-center">
            <MapPin className="w-4 h-4" />
            {user.location}
          </p>

          {/* Stats */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-gray-900 mb-1 transition-colors">
              {animatedPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              pts {periodText !== "all time" ? periodText : "(all time)"}
            </div>
            {deltaLine && (
              <div className="mt-2 text-xs font-medium text-orange-600">
                {deltaLine}
              </div>
            )}
          </div>

          {/* Level Badge */}
          <span
            className={`${getLevelColor(
              user.level_id
            )} bg-white/90 px-3 py-1.5 rounded-full font-semibold shadow-lg backdrop-blur-sm mb-4 inline-block`}
          >
            {getLevelName(user.level_id)}
          </span>

          {/* Quick Stats removed (posts/replies/upvotes not yet supported) */}
        </div>
        {/* Pedestal bar (purely decorative) */}
        <div
          className={`mt-6 mx-auto rounded-b-xl rounded-t-sm w-10 bg-gradient-to-t from-gray-200 to-white/50 shadow-inner
          ${position === 1 ? "h-8" : position === 2 ? "h-6" : "h-5"}`}
          aria-hidden="true"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-2 sm:p-4 md:p-6">
      <div className="container mx-auto max-w-6xl">
        {(simpleLoading || paginatedLoading) && (
          <div className="mb-4 text-sm text-gray-500">
            Loading live leaderboard...
          </div>
        )}
        {isError && (
          <div className="mb-4 text-sm text-red-500">
            Failed to load leaderboard data.
          </div>
        )}
        {/* Header */}
        <div className="overflow-hidden shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm w-full mb-8">
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white relative overflow-hidden p-6">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  onClick={onBackToDiscussions}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-xl p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-sm">
                    Community Leaderboard
                  </h1>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm">
                  <span className="text-white/80">Total Farmers: </span>
                  <span className="text-white font-semibold">
                    {stats.totalUsers.toLocaleString()}
                  </span>
                </div>
                {/* Active This Week metric removed until backend provides real value */}
                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm">
                  <span className="text-white/80">Your Rank: </span>
                  <span className="text-white font-semibold">
                    #{currentUser?.rank || currentUserRank || "?"}
                  </span>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm">
                  <span className="text-white/80">
                    {stats.yourPercentile
                      ? `Top ${stats.yourPercentile}%`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!showFullRankings ? (
          <>
            {/* Podium Section - Top 3 (only render when we have at least 3 live users) */}
            {hasMinimumTop ? (
              <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  {podiumHeading}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Recognizing the most helpful contributors
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div className="order-1 md:order-2">
                    <PodiumCard
                      user={podiumUsers[0]}
                      position={1}
                      context={{ leadMargin: leaderLead }}
                    />
                  </div>
                  <div className="order-2 md:order-1">
                    <PodiumCard
                      user={podiumUsers[1]}
                      position={2}
                      context={{ pointsToNext: secondNeeds }}
                    />
                  </div>
                  <div className="order-3 md:order-3">
                    <PodiumCard
                      user={podiumUsers[2]}
                      position={3}
                      context={{ pointsToNext: thirdNeeds }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  {podiumHeading}
                </h2>
                <p className="text-sm text-gray-500">
                  Not enough leaderboard data to display the podium yet.
                </p>
              </div>
            )}

            {/* Top 10 Section (only if we have data beyond podium) */}
            {otherTopUsers.length > 0 && (
              <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <Star className="h-5 w-5 text-orange-500" />
                  Top 10 Rankings
                </h2>
                <div className="space-y-4">
                  {otherTopUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </div>
            )}

            {/* Compressed Middle Section */}
            <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <div className="text-center py-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent backdrop-blur-sm rounded-2xl"></div>
                  <div className="relative z-10 space-y-4">
                    <Users className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {stats.totalUsers > 10
                          ? `... and ${Math.max(
                              0,
                              stats.totalUsers - 10
                            )} more farmers`
                          : "Leaderboard still populating"}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Discover where you rank among our growing community
                      </p>
                      <Button
                        onClick={() => setShowFullRankings(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        View Full Rankings
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current User Section */}
            {currentUser && (
              <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Your Position
                </h2>
                <div className="space-y-6">
                  <UserCard
                    user={currentUser}
                    isCurrentUser={true}
                    size="large"
                  />

                  <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 rounded-xl p-6 backdrop-blur-sm shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">You're ahead of</span>
                        <span className="font-semibold text-green-600 ml-1">
                          {(
                            ((stats.totalUsers - currentUser.rank) /
                              stats.totalUsers) *
                            100
                          ).toFixed(0)}
                          % of farmers
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          Points to next rank:
                        </span>
                        <span className="font-semibold text-orange-600 ml-1">
                          {usersNearCurrent.find(
                            (u) => u.rank === currentUser.rank - 1
                          )?.points
                            ? usersNearCurrent.find(
                                (u) => u.rank === currentUser.rank - 1
                              )!.points - currentUser.points
                            : "Unknown"}{" "}
                          points
                        </span>
                      </div>
                    </div>
                  </div>

                  {usersNearCurrent.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Nearby Rankings
                      </h3>
                      <div className="space-y-3">
                        {usersNearCurrent.map((user) => (
                          <UserCard key={user.id} user={user} size="small" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Full Rankings View */
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-500" />
                Full Rankings
              </h2>
              <Button
                onClick={() => setShowFullRankings(false)}
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Collapse View
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-xl bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-300"
                />
              </div>

              <div className="flex gap-2">
                {(["day", "week", "month", "all"] as const).map((range) => (
                  <Button
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                    variant={
                      selectedTimeRange === range ? "default" : "outline"
                    }
                    size="sm"
                    className={`rounded-xl ${
                      selectedTimeRange === range
                        ? "bg-orange-500 hover:bg-orange-600"
                        : ""
                    }`}
                  >
                    {range === "day"
                      ? "Today"
                      : range === "week"
                      ? "This Week"
                      : range === "month"
                      ? "This Month"
                      : "All Time"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {getCurrentPageUsers.length === 0 &&
                !paginatedLoading &&
                !simpleLoading && (
                  <div className="p-8 text-center rounded-xl border border-dashed border-gray-200 bg-white/60 backdrop-blur-sm">
                    <p className="text-gray-600 font-medium mb-2">
                      No rankings to display
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Try a different time range or clear your search.
                    </p>
                  </div>
                )}
              {getCurrentPageUsers.length === 0 &&
                (paginatedLoading || simpleLoading) && (
                  <div className="space-y-3" aria-label="Loading leaderboard">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-16 rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse"
                      />
                    ))}
                  </div>
                )}
              {getCurrentPageUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  isCurrentUser={user.id === currentUser?.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  Previous
                </Button>

                <div className="flex gap-1 items-center">
                  {/* First page */}
                  {currentPage > 3 && (
                    <Button
                      onClick={() => setCurrentPage(1)}
                      variant={currentPage === 1 ? "default" : "outline"}
                      size="sm"
                      className="rounded-xl"
                    >
                      1
                    </Button>
                  )}
                  {currentPage > 4 && (
                    <span className="px-1 text-xs text-gray-500">…</span>
                  )}
                  {/* Window around current */}
                  {Array.from({ length: 5 }, (_, i) => i - 2) // -2,-1,0,1,2
                    .map((delta) => currentPage + delta)
                    .filter(
                      (p) =>
                        p >= 1 &&
                        p <= totalPages &&
                        Math.abs(p - currentPage) <= 2
                    )
                    .map((page) => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={`rounded-xl ${
                          currentPage === page
                            ? "bg-orange-500 hover:bg-orange-600"
                            : ""
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  {currentPage < totalPages - 3 && (
                    <span className="px-1 text-xs text-gray-500">…</span>
                  )}
                  {currentPage < totalPages - 2 && (
                    <Button
                      onClick={() => setCurrentPage(totalPages)}
                      variant={
                        currentPage === totalPages ? "default" : "outline"
                      }
                      size="sm"
                      className="rounded-xl"
                    >
                      {totalPages}
                    </Button>
                  )}
                </div>

                <Button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
