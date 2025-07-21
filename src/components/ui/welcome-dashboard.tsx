import { Card } from "@/components/ui/card";
import { Sprout, Users, MessageSquare, BookOpen } from "lucide-react";

interface WelcomeDashboardProps {
  userName?: string;
}

export function WelcomeDashboard({
  userName = "Farmer",
}: WelcomeDashboardProps) {
  const stats = [
    {
      name: "Active Discussions",
      value: "12",
      icon: MessageSquare,
      change: "+2 this week",
      changeType: "increase" as const,
    },
    {
      name: "Best Practices",
      value: "48",
      icon: BookOpen,
      change: "+5 new guides",
      changeType: "increase" as const,
    },
    {
      name: "Community Members",
      value: "1,234",
      icon: Users,
      change: "+23 this month",
      changeType: "increase" as const,
    },
    {
      name: "Farm Projects",
      value: "8",
      icon: Sprout,
      change: "2 completed",
      changeType: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {userName}! 🌾
            </h1>
            <p className="text-orange-100">
              Ready to continue your precision pig farming journey?
            </p>
          </div>
          <div className="hidden sm:block">
            <Sprout className="w-16 h-16 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="w-8 h-8 text-orange-500" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span
                  className={`
                    ${
                      stat.changeType === "increase"
                        ? "text-green-600"
                        : "text-gray-600"
                    }
                  `}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                New best practice guide: "Feed Optimization Strategies"
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Discussion replied: "Ventilation System Setup"
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                5 new community members joined this week
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">
                Start New Discussion
              </div>
              <div className="text-sm text-gray-600">
                Ask questions or share insights with the community
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">
                Browse Best Practices
              </div>
              <div className="text-sm text-gray-600">
                Explore proven farming techniques and strategies
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
