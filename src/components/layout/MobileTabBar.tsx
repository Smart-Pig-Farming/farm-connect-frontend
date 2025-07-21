import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  MessageSquare,
  BookOpen,
  Users,
  type LucideIcon,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface MobileNavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  shortName: string;
  permission?: string;
}

const baseNavigation: MobileNavigationItem[] = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: Home,
    shortName: "Home",
  },
  {
    name: "Discussions",
    href: "/dashboard/discussions",
    icon: MessageSquare,
    shortName: "Chat",
  },
  {
    name: "Best Practices",
    href: "/dashboard/best-practices",
    icon: BookOpen,
    shortName: "Guide",
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: Users,
    shortName: "Users",
    permission: "MANAGE:USERS",
  },
];

export function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();

  // Filter navigation items based on user permissions
  const navigation = baseNavigation.filter((item) => {
    if (item.permission) {
      return hasPermission(item.permission);
    }
    return true; // Show items without permission requirements
  });

  // Dynamic grid columns based on number of items
  const getGridCols = (itemCount: number) => {
    switch (itemCount) {
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      default:
        return "grid-cols-4";
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 w-screen bg-white/98 backdrop-blur-xl border-t border-gray-300/50 z-40 shadow-2xl safe-area-pb overflow-x-hidden">
      {/* Enhanced gradient overlay for depth - more subtle */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent pointer-events-none" />

      {/* Refined grid layout with improved aesthetics */}
      <div
        className={`grid ${getGridCols(
          navigation.length
        )} w-full min-w-0 relative`}
      >
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className="flex flex-col items-center justify-center min-w-0 w-full relative overflow-visible py-3 group transition-all duration-300 ease-out"
              aria-label={item.name}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {/* Elevated active background - clean and cohesive */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-orange-50 via-white to-white rounded-t-xl shadow-lg border border-orange-200/60" />
              )}

              {/* Hover background effect */}
              <div className="absolute inset-0 bg-gray-50 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Refined active indicator */}
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-b-lg pointer-events-none"
                  style={{ maxWidth: "90%" }}
                />
              )}

              {/* Icon container with elevated styling */}
              <div
                className={`
                  relative z-10 p-2.5 rounded-xl transition-all duration-300 mb-1.5
                  ${
                    isActive
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 scale-105"
                      : "bg-gray-50 group-hover:bg-gray-100 group-hover:scale-105"
                  }
                `}
              >
                <Icon
                  className={`w-[15px] h-[15px] sm:w-[18px] sm:h-[18px] transition-colors duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-gray-600 group-hover:text-gray-800"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>

              {/* Clean, readable text with proper contrast */}
              <span
                className={`text-[9px] sm:text-[11px] font-semibold transition-all duration-300 ${
                  isActive
                    ? "text-orange-700"
                    : "text-gray-600 group-hover:text-gray-800"
                } block truncate w-full text-center leading-tight relative z-10`}
              >
                {item.shortName}
              </span>

              {/* Interaction feedback ripple effect */}
              <div className="absolute inset-0 bg-orange-500/10 scale-0 group-active:scale-100 transition-transform duration-150 rounded-t-xl" />

              {/* Screen reader text */}
              <span className="sr-only">{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Enhanced safe area with subtle gradient */}
      <div className="h-safe-area-inset-bottom bg-gradient-to-t from-white/40 to-transparent" />
    </div>
  );
}
