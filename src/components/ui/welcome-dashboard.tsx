import {
  MessageSquare,
  BookOpen,
  TrendingUp,
  Award,
  Zap,
  PiggyBank,
  MessageCircle,
  ThumbsUp,
  Brain,
  ArrowRight,
} from "lucide-react";
import { useGetMyScoreQuery } from "@/store/api/scoreApi";
import { useAppSelector } from "@/store/hooks";
import { useNavigate } from "react-router-dom";

interface WelcomeDashboardProps {
  userName?: string;
}

// --- Metrics Panel Subcomponent -------------------------------------------------
interface MetricsPanelProps {
  totalPoints: number;
  levelLabel: string;
  currentStreak: number;
  bestStreak: number;
}

const streakMilestones = [7, 30, 90, 180, 365];

function nextStreakMilestone(current: number) {
  for (const m of streakMilestones) if (current < m) return m;
  return null;
}

const bonusFor = (streak: number) => {
  if (streak === 7) return 5;
  if (streak === 30) return 10;
  if (streak === 90) return 15;
  if (streak === 180) return 20;
  if (streak === 365) return 25;
  return 0;
};

const streakIcon = (s: number) =>
  s === 0
    ? "⭕"
    : s < 7
    ? "🔥"
    : s < 30
    ? "💥"
    : s < 90
    ? "⚡"
    : s < 180
    ? "🌟"
    : "🏆";

const MetricsPanel = ({
  totalPoints,
  levelLabel,
  currentStreak,
  bestStreak,
}: MetricsPanelProps) => {
  const next = nextStreakMilestone(currentStreak);
  const daysToGo = next ? next - currentStreak : 0;
  const bonus = next ? bonusFor(next) : 0;

  return (
    <div className="bg-white border-t-4 border-b-4 border-orange-500 py-6 sm:py-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* Bold Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-3 tracking-tight px-2">
            Your Progress Dashboard
          </h2>
          <p className="text-base sm:text-lg text-gray-700 font-medium max-w-2xl mx-auto px-2">
            Every interaction builds your farming expertise and unlocks new
            opportunities
          </p>
        </div>

        {/* Enhanced Main Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
          {/* Points & Level Section - Enhanced */}
          <div className="text-center group">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border-2 border-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <div className="space-y-6">
                <div>
                  <div className="text-5xl md:text-6xl font-black text-orange-600 tabular-nums mb-2 group-hover:scale-105 transition-transform duration-300">
                    {totalPoints.toLocaleString()}
                  </div>
                  <div className="text-orange-800 text-base font-bold uppercase tracking-wider">
                    Total Points
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-orange-300 to-amber-300 w-20 mx-auto rounded-full"></div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {levelLabel}
                  </div>
                  <div className="text-gray-700 text-base font-semibold uppercase tracking-wider">
                    Current Level
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Streak Section - Enhanced */}
          <div className="text-center group">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border-2 border-amber-100 hover:border-amber-300 transition-all duration-300 hover:shadow-lg">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-200 to-amber-200 rounded-3xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-3xl mb-1">
                      {streakIcon(currentStreak)}
                    </div>
                    <div className="text-2xl font-black text-gray-800 tabular-nums">
                      {currentStreak}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-gray-900 font-bold text-xl mb-2">
                    Daily Streak
                  </div>
                  <div className="text-gray-700 text-base font-medium">
                    {currentStreak === 0
                      ? "🚀 Start your journey today!"
                      : currentStreak === 1
                      ? "💪 One day strong!"
                      : `🔥 ${currentStreak} days of excellence!`}
                  </div>
                </div>
                {bestStreak > currentStreak && (
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    <span>👑</span>
                    <span>Personal Best: {bestStreak} days</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Milestone Section - Enhanced */}
          <div className="text-center group">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-200 to-green-200 rounded-3xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl text-emerald-600">🎯</div>
                </div>
                <div>
                  <div className="text-gray-900 font-bold text-xl mb-2">
                    Next Goal
                  </div>
                  {next ? (
                    <div className="space-y-2">
                      <div className="text-gray-800 font-bold text-lg">
                        {daysToGo} day{daysToGo === 1 ? "" : "s"} to {next}{" "}
                        milestone
                      </div>
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        <span>🎁</span>
                        <span>+{bonus} bonus points waiting!</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-gray-800 font-bold text-lg">
                        🎉 Maximum reached!
                      </div>
                      <div className="text-emerald-600 font-medium">
                        You're a farming legend!
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Milestone Progress */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-3xl p-8 border-2 border-gray-100 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 tracking-tight">
              🏆 Streak Milestones Journey
            </h3>
            <p className="text-base text-gray-700 font-medium max-w-xl mx-auto">
              Your path to farming mastery - each milestone unlocks bigger
              rewards
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Progress Line */}
            <div className="relative mb-8">
              <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full"></div>
              <div
                className="absolute top-6 left-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min((currentStreak / 365) * 100, 100)}%`,
                }}
              ></div>

              <div className="relative flex justify-between">
                {[7, 30, 90, 180, 365].map((milestone, i) => {
                  const isCompleted = currentStreak >= milestone;
                  const isCurrent = next === milestone;
                  const milestoneColors = [
                    {
                      bg: "from-orange-500 to-red-500",
                      text: "text-orange-600",
                      ring: "ring-orange-200",
                    },
                    {
                      bg: "from-red-500 to-pink-500",
                      text: "text-red-600",
                      ring: "ring-red-200",
                    },
                    {
                      bg: "from-blue-500 to-indigo-500",
                      text: "text-blue-600",
                      ring: "ring-blue-200",
                    },
                    {
                      bg: "from-purple-500 to-violet-500",
                      text: "text-purple-600",
                      ring: "ring-purple-200",
                    },
                    {
                      bg: "from-yellow-500 to-amber-500",
                      text: "text-yellow-600",
                      ring: "ring-yellow-200",
                    },
                  ];

                  const bonusPoints = bonusFor(milestone);

                  return (
                    <div key={milestone} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCompleted
                            ? `bg-gradient-to-br ${milestoneColors[i].bg} text-white shadow-lg scale-110`
                            : isCurrent
                            ? `bg-white border-4 border-orange-400 ${milestoneColors[i].text} shadow-lg scale-110 animate-pulse ring-4 ${milestoneColors[i].ring}`
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <span className="text-sm font-bold">
                          {isCompleted
                            ? "✓"
                            : milestone <= 30
                            ? "🔥"
                            : milestone <= 90
                            ? "⚡"
                            : milestone <= 180
                            ? "🌟"
                            : "🏆"}
                        </span>
                      </div>
                      <div
                        className={`text-sm font-bold mt-3 ${
                          isCompleted
                            ? milestoneColors[i].text
                            : isCurrent
                            ? milestoneColors[i].text
                            : "text-gray-500"
                        }`}
                      >
                        {milestone} days
                      </div>
                      <div
                        className={`text-xs font-medium mt-1 ${
                          isCompleted
                            ? "text-green-600"
                            : isCurrent
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      >
                        +{bonusPoints} pts
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Motivational Message */}
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                {currentStreak === 0
                  ? "🌱 Your farming journey starts with a single day!"
                  : next
                  ? `💪 Only ${daysToGo} more day${
                      daysToGo === 1 ? "" : "s"
                    } to your next milestone!`
                  : "🎉 You've conquered all milestones - you're a true farming champion!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function WelcomeDashboard({
  userName = "Farmer",
}: WelcomeDashboardProps) {
  const { data: myScore } = useGetMyScoreQuery();
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const currentStreak = myScore?.streak?.current || 0;
  const bestStreak = myScore?.streak?.best || 0;
  const totalPoints = myScore?.totalPoints || 0;
  const levelLabel = myScore?.levelLabel || "Newcomer";

  const handleNavigateToDiscussions = () => navigate("/dashboard/discussions");
  const handleNavigateToBestPractices = () =>
    navigate("/dashboard/best-practices");
  const handleNavigateToQuiz = () =>
    navigate("/dashboard/best-practices?mode=quiz");

  const pointActivities = [
    {
      action: "Start a Discussion",
      points: "+2",
      description: "Share insights or ask questions",
      icon: MessageSquare,
      cardBg: "bg-orange-50",
      border: "border border-orange-200",
      iconWrapper: "bg-white text-orange-600 ring-1 ring-orange-100",
      heading: "text-orange-900",
      body: "text-orange-700",
      pointsPill: "bg-orange-100 text-orange-800",
      buttonAction: "Create Discussion",
      onClick: handleNavigateToDiscussions,
    },
    {
      action: "Reply to Posts",
      points: "+1",
      description: "Join the conversation",
      icon: MessageCircle,
      cardBg: "bg-amber-50",
      border: "border border-amber-200",
      iconWrapper: "bg-white text-amber-600 ring-1 ring-amber-100",
      heading: "text-amber-900",
      body: "text-amber-700",
      pointsPill: "bg-amber-100 text-amber-800",
      buttonAction: "Browse Discussions",
      onClick: handleNavigateToDiscussions,
    },
    {
      action: "Read Best Practices",
      points: "+1",
      description: "Learn new techniques",
      icon: BookOpen,
      cardBg: "bg-rose-50",
      border: "border border-rose-200",
      iconWrapper: "bg-white text-rose-600 ring-1 ring-rose-100",
      heading: "text-rose-900",
      body: "text-rose-700",
      pointsPill: "bg-rose-100 text-rose-800",
      buttonAction: "Explore Guides",
      onClick: handleNavigateToBestPractices,
    },
    {
      action: "Give Reactions",
      points: "+1",
      description: "Upvote helpful content",
      icon: ThumbsUp,
      cardBg: "bg-orange-50",
      border: "border border-orange-200",
      iconWrapper: "bg-white text-orange-500 ring-1 ring-orange-100",
      heading: "text-orange-900",
      body: "text-orange-700",
      pointsPill: "bg-orange-100 text-orange-800",
      buttonAction: "Find Posts",
      onClick: handleNavigateToDiscussions,
    },
    {
      action: "Complete Quiz",
      points: "+5",
      description: "Pass with 70% or higher",
      icon: Brain,
      cardBg: "bg-yellow-50",
      border: "border border-yellow-200",
      iconWrapper: "bg-white text-yellow-600 ring-1 ring-yellow-100",
      heading: "text-yellow-900",
      body: "text-yellow-700",
      pointsPill: "bg-yellow-100 text-yellow-800",
      buttonAction: "Take Quiz",
      onClick: handleNavigateToQuiz,
    },
    {
      action: "Get Upvotes",
      points: "+1 each",
      description: "Quality content gets rewarded",
      icon: TrendingUp,
      cardBg: "bg-orange-50",
      border: "border border-orange-300",
      iconWrapper: "bg-white text-orange-600 ring-1 ring-orange-200",
      heading: "text-orange-900",
      body: "text-orange-700",
      pointsPill: "bg-orange-100 text-orange-800",
      buttonAction: "Share Knowledge",
      onClick: handleNavigateToDiscussions,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/40">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 p-3 sm:p-6">
        {/* Hero */}
        <div className="relative">
          <div className="bg-gradient-to-r from-orange-600 via-orange-600 to-amber-500 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            </div>
            <div className="relative z-10 text-center space-y-4 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                  <PiggyBank className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight px-2">
                    Welcome back, {user?.firstname || userName}!
                  </h1>
                  <p className="text-base sm:text-xl md:text-2xl text-orange-100 font-light max-w-2xl mx-auto px-2">
                    Your precision pig farming journey continues here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MetricsPanel
          totalPoints={totalPoints}
          levelLabel={levelLabel}
          currentStreak={currentStreak}
          bestStreak={bestStreak}
        />

        {/* Activities */}
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 px-2">
              How to Earn Points
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Engage with the community and expand your knowledge to climb the
              leaderboard
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {pointActivities.map((activity, i) => {
              const Icon = activity.icon;
              return (
                <div
                  key={i}
                  className={`${activity.cardBg} ${activity.border} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 cursor-pointer`}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("button")) return;
                    activity.onClick();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      activity.onClick();
                    }
                  }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-bl from-orange-100/40 to-transparent rounded-bl-2xl sm:rounded-bl-3xl opacity-70 pointer-events-none" />
                  <div className="relative space-y-3 sm:space-y-4">
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${activity.iconWrapper} ring-1 ring-black/5`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span
                        className={`${activity.pointsPill} px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold tracking-tight`}
                      >
                        {activity.points}
                      </span>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <h3
                        className={`text-base sm:text-lg font-semibold ${activity.heading}`}
                      >
                        {activity.action}
                      </h3>
                      <p className={`text-sm leading-relaxed ${activity.body}`}>
                        {activity.description}
                      </p>
                    </div>
                    <button
                      onClick={activity.onClick}
                      className="w-full bg-orange-600 hover:bg-orange-700 hover:cursor-pointer text-white font-medium py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-600 text-sm sm:text-base"
                    >
                      {activity.buttonAction}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scoring System */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 text-gray-900 border border-orange-100">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-orange-100/70 backdrop-blur-sm rounded-xl sm:rounded-2xl ring-1 ring-orange-200">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold px-2">
                Level Up Your Farming Game
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
                Every interaction builds your expertise and unlocks new features
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 max-w-5xl mx-auto">
              <div className="text-center space-y-1 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/60 border border-orange-100 shadow-sm">
                <div className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-orange-500">
                  LEVEL 1
                </div>
                <div className="text-base sm:text-lg font-bold text-orange-700">
                  Newcomer
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  0-20 pts
                </div>
              </div>
              <div className="text-center space-y-1 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/60 border border-amber-100 shadow-sm">
                <div className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-amber-500">
                  LEVEL 2
                </div>
                <div className="text-base sm:text-lg font-bold text-amber-700">
                  Amateur
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  21-149 pts
                </div>
              </div>
              <div className="text-center space-y-1 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/60 border border-rose-100 shadow-sm">
                <div className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-rose-500">
                  LEVEL 3
                </div>
                <div className="text-base sm:text-lg font-bold text-rose-700">
                  Contributor
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  150-299 pts
                </div>
              </div>
              <div className="text-center space-y-1 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/60 border border-yellow-100 shadow-sm">
                <div className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-yellow-500">
                  LEVEL 4
                </div>
                <div className="text-base sm:text-lg font-bold text-yellow-700">
                  Knight
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  300-599 pts
                </div>
              </div>
              <div className="text-center space-y-1 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/60 border border-orange-200 shadow-sm relative">
                <div className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-orange-600">
                  LEVEL 5
                </div>
                <div className="text-base sm:text-lg font-bold text-orange-700">
                  Expert
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  600+ pts
                </div>
                <div className="text-[9px] sm:text-[10px] font-medium text-orange-500 mt-1">
                  Gateway to endgame
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 max-w-2xl mx-auto mt-3 sm:mt-4 px-2">
              After Expert, Prestige tiers (Bronze / Silver / Gold) unlock via
              higher total points and Moderator Approved posts.
            </p>
            <button
              onClick={handleNavigateToDiscussions}
              className="inline-flex items-center gap-2 sm:gap-3 bg-orange-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl hover:bg-orange-700 hover:cursor-pointer transition-all duration-200 group shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-600 text-sm sm:text-base"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              Get Started Now
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
