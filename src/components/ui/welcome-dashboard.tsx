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

export function WelcomeDashboard({
  userName = "Farmer",
}: WelcomeDashboardProps) {
  const { data: myScore } = useGetMyScoreQuery();
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const currentStreak = myScore?.streak?.current || 0;
  const bestStreak = myScore?.streak?.best || 0;
  const totalPoints = myScore?.totalPoints || 0;
  const levelLabel = myScore?.levelLabel || "Newcomer";

  // Navigation handlers
  const handleNavigateToDiscussions = () => navigate("/dashboard/discussions");
  const handleNavigateToBestPractices = () =>
    navigate("/dashboard/best-practices");
  const handleNavigateToQuiz = () =>
    navigate("/dashboard/best-practices?mode=quiz");

  // Point earning activities - simplified and action-focused
  // Restored orange as primary brand color. Keep explicit Tailwind classes (no template interpolation) for JIT safety.
  // Each card keeps a subtle distinct accent while CTAs + key highlights use orange.
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
      <div className="max-w-6xl mx-auto space-y-12 p-6">
        {/* Hero Section - Modern & Clean */}
        <div className="relative">
          <div className="bg-gradient-to-r from-orange-600 via-orange-600 to-amber-500 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            </div>

            <div className="relative z-10 text-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl">
                  <PiggyBank className="w-10 h-10 text-white" />
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    Welcome back, {user?.firstname || userName}!
                  </h1>
                  <p className="text-xl md:text-2xl text-orange-100 font-light max-w-2xl mx-auto">
                    Your precision pig farming journey continues here
                  </p>
                </div>
              </div>

              {/* COMPLETELY REDESIGNED - Clean Professional Stats Section */}
              <div className="flex flex-col lg:flex-row items-center gap-8 bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-white/80 shadow-2xl">
                {/* Clean, High-Contrast Points & Level Display */}
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900">
                      {totalPoints.toLocaleString()}
                    </div>
                    <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                      Points
                    </div>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">
                      {levelLabel}
                    </div>
                    <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                      Level
                    </div>
                  </div>
                </div>

                {/* REDESIGNED - Clean Modern Streak Visualization */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative group">
                    {/* Subtle Glow Ring - Clean and Professional */}
                    <div className="absolute inset-0 w-36 h-36 rounded-full bg-gradient-to-r from-orange-400/25 to-amber-400/25 blur-sm animate-pulse" />

                    {/* Main Streak Container - Clean White Design */}
                    <div className="relative w-32 h-32 bg-white border-4 border-orange-200 rounded-full shadow-xl flex flex-col items-center justify-center group-hover:scale-105 transition-all duration-300">
                      {/* Clean Flame Icon */}
                      <div className="relative mb-2">
                        <div className="relative text-3xl">
                          {currentStreak === 0
                            ? "⭕"
                            : currentStreak < 7
                            ? "🔥"
                            : currentStreak < 30
                            ? "💥"
                            : currentStreak < 90
                            ? "⚡"
                            : currentStreak < 180
                            ? "🌟"
                            : "🏆"}
                        </div>
                      </div>

                      {/* Clean Streak Number and Text */}
                      <div className="text-2xl font-black text-gray-800">
                        {currentStreak}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                        STREAK
                      </div>
                    </div>

                    {/* Enhanced Progress Indicators with Color Coordination */}
                    <div className="absolute inset-0 w-32 h-32">
                      {[7, 30, 90, 180, 365].map((milestone, i) => {
                        const angle = i * 60 - 90; // Spread around circle
                        const isCompleted = currentStreak >= milestone;
                        const isCurrent =
                          currentStreak < milestone &&
                          (i === 0 || currentStreak >= [0, 7, 30, 90, 180][i]);

                        const milestoneColors = [
                          "bg-orange-400 shadow-orange-400/50", // 7 days
                          "bg-red-400 shadow-red-400/50", // 30 days
                          "bg-blue-400 shadow-blue-400/50", // 90 days
                          "bg-purple-400 shadow-purple-400/50", // 180 days
                          "bg-yellow-400 shadow-yellow-400/50", // 365 days
                        ];

                        return (
                          <div
                            key={milestone}
                            className="absolute"
                            style={{
                              top: "50%",
                              left: "50%",
                              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-54px)`,
                            }}
                          >
                            <div
                              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                                isCompleted
                                  ? `${milestoneColors[i]} scale-110`
                                  : isCurrent
                                  ? `${milestoneColors[i]} animate-pulse`
                                  : "bg-slate-600/30"
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Best Streak Crown with Enhanced Styling */}
                    {bestStreak > currentStreak && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white/20 backdrop-blur-sm">
                        👑 {bestStreak}
                      </div>
                    )}
                  </div>
                </div>

                {/* Clean Next Milestone Display */}
                <div className="text-center lg:text-left">
                  <div className="text-sm text-gray-600 mb-3 flex items-center gap-2 justify-center lg:justify-start">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-orange-400" />
                    Next Milestone
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {currentStreak < 7
                          ? "🎯"
                          : currentStreak < 30
                          ? "🚀"
                          : currentStreak < 90
                          ? "💎"
                          : currentStreak < 180
                          ? "⭐"
                          : "🏅"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">
                          {currentStreak < 7
                            ? `${7 - currentStreak} days to go`
                            : currentStreak < 30
                            ? `${30 - currentStreak} days to go`
                            : currentStreak < 90
                            ? `${90 - currentStreak} days to go`
                            : currentStreak < 180
                            ? `${180 - currentStreak} days to go`
                            : currentStreak < 365
                            ? `${365 - currentStreak} days to go`
                            : "Max reached! 🎉"}
                        </div>
                        <div className="text-xs text-gray-600">
                          +
                          {currentStreak < 7
                            ? "5"
                            : currentStreak < 30
                            ? "10"
                            : currentStreak < 90
                            ? "15"
                            : currentStreak < 180
                            ? "20"
                            : currentStreak < 365
                            ? "25"
                            : "0"}{" "}
                          bonus points
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Earn Points - Modern Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How to Earn Points
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Engage with the community and expand your knowledge to climb the
              leaderboard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pointActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className={`${activity.cardBg} ${activity.border} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 cursor-pointer`}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    // Avoid double trigger if inner action button clicked
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
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-100/40 to-transparent rounded-bl-3xl opacity-70 pointer-events-none" />
                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-3 rounded-xl ${activity.iconWrapper} ring-1 ring-black/5`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span
                        className={`${activity.pointsPill} px-3 py-1 rounded-full text-sm font-semibold tracking-tight`}
                      >
                        {activity.points}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3
                        className={`text-lg font-semibold ${activity.heading}`}
                      >
                        {activity.action}
                      </h3>
                      <p className={`text-sm leading-relaxed ${activity.body}`}>
                        {activity.description}
                      </p>
                    </div>
                    <button
                      onClick={activity.onClick}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-600"
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

        {/* Scoring System Reference */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-8 md:p-12 text-gray-900 border border-orange-100">
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100/70 backdrop-blur-sm rounded-2xl ring-1 ring-orange-200">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Level Up Your Farming Game
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Every interaction builds your expertise and unlocks new features
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
              {/* Level 1: Newcomer (0-20 pts) */}
              <div className="text-center space-y-1 p-4 rounded-xl bg-white/60 border border-orange-100 shadow-sm">
                <div className="text-[11px] font-semibold tracking-wide text-orange-500">
                  LEVEL 1
                </div>
                <div className="text-lg font-bold text-orange-700">
                  Newcomer
                </div>
                <div className="text-sm font-medium text-gray-600">
                  0-20 pts
                </div>
              </div>
              {/* Level 2: Amateur (21-149 pts) */}
              <div className="text-center space-y-1 p-4 rounded-xl bg-white/60 border border-amber-100 shadow-sm">
                <div className="text-[11px] font-semibold tracking-wide text-amber-500">
                  LEVEL 2
                </div>
                <div className="text-lg font-bold text-amber-700">Amateur</div>
                <div className="text-sm font-medium text-gray-600">
                  21-149 pts
                </div>
              </div>
              {/* Level 3: Contributor (150-299 pts) */}
              <div className="text-center space-y-1 p-4 rounded-xl bg-white/60 border border-rose-100 shadow-sm">
                <div className="text-[11px] font-semibold tracking-wide text-rose-500">
                  LEVEL 3
                </div>
                <div className="text-lg font-bold text-rose-700">
                  Contributor
                </div>
                <div className="text-sm font-medium text-gray-600">
                  150-299 pts
                </div>
              </div>
              {/* Level 4: Knight (300-599 pts) */}
              <div className="text-center space-y-1 p-4 rounded-xl bg-white/60 border border-yellow-100 shadow-sm">
                <div className="text-[11px] font-semibold tracking-wide text-yellow-500">
                  LEVEL 4
                </div>
                <div className="text-lg font-bold text-yellow-700">Knight</div>
                <div className="text-sm font-medium text-gray-600">
                  300-599 pts
                </div>
              </div>
              {/* Level 5: Expert (600+ pts) — Gateway to endgame */}
              <div className="text-center space-y-1 p-4 rounded-xl bg-white/60 border border-orange-200 shadow-sm relative">
                <div className="text-[11px] font-semibold tracking-wide text-orange-600">
                  LEVEL 5
                </div>
                <div className="text-lg font-bold text-orange-700">Expert</div>
                <div className="text-sm font-medium text-gray-600">
                  600+ pts
                </div>
                <div className="text-[10px] font-medium text-orange-500 mt-1">
                  Gateway to endgame
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 max-w-2xl mx-auto mt-4">
              After Expert, Prestige tiers (Bronze / Silver / Gold) unlock via
              higher total points and Moderator Approved posts.
            </p>

            <button
              onClick={handleNavigateToDiscussions}
              className="inline-flex items-center gap-3 bg-orange-600 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-orange-700 transition-all duration-200 group shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-600"
            >
              <Zap className="w-5 h-5" />
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
