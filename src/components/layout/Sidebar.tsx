import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Home,
  MessageSquare,
  BookOpen,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useLogoutMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Discussions", href: "/dashboard/discussions", icon: MessageSquare },
  { name: "Best Practices", href: "/dashboard/best-practices", icon: BookOpen },
  { name: "User Management", href: "/dashboard/users", icon: Users },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  isMobile?: boolean;
}

export function Sidebar({
  collapsed,
  onToggle,
  isMobile = false,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    // Show loading toast
    const loadingToastId = toast.loading("Signing out...", {
      description: "Please wait while we sign you out.",
    });

    try {
      // Call the logout API
      await logoutMutation().unwrap();

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // Clear local state
      dispatch(logout());

      // Clear token from localStorage
      localStorage.removeItem("token");

      // Show success toast
      toast.success("Signed out successfully!", {
        description: "You have been logged out of your account.",
        duration: 3000,
      });

      // Navigate to homepage
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // Even if API fails, clear local state for security
      dispatch(logout());
      localStorage.removeItem("token");

      // Show error toast
      toast.error("Logout completed with warnings", {
        description: "You have been logged out locally.",
        duration: 4000,
      });

      // Navigate to homepage
      navigate("/");
    }
  };

  if (isMobile) {
    return null; // Mobile uses bottom tab bar instead
  }

  return (
    <div
      className={`
        hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 
        bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-xl 
        transition-all duration-300 ease-in-out z-30
        ${collapsed ? "lg:w-16" : "lg:w-60"}
      `}
    >
      {/* Header with Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100/50">
        <div className="flex items-center space-x-3 overflow-hidden">
          {/* Logo Icon - Always visible */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-orange-200/50">
              <div className="relative">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L13.09 6.26L18 5L16.74 9.74L22 8.64L19.66 12L22 15.36L16.74 14.26L18 19L13.09 17.74L12 22L10.91 17.74L6 19L7.26 14.26L2 15.36L4.34 12L2 8.64L7.26 9.74L6 5L10.91 6.26L12 2Z" />
                </svg>
                <svg
                  className="w-3 h-3 text-white/90 absolute -bottom-1 -right-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Brand Text - Hidden when collapsed */}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold tracking-tight truncate leading-tight">
                <span className="text-gray-900">Farm</span>
                <span className="text-orange-500">Connect</span>
              </h1>
              <p className="text-xs text-gray-500 truncate leading-tight">
                Dashboard Portal
              </p>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => onToggle(!collapsed)}
          className="p-2 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50/80 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`
                group flex items-center w-full text-left rounded-xl transition-all duration-200 relative overflow-hidden hover:cursor-pointer
                ${collapsed ? "px-3 py-3 justify-center" : "px-4 py-3.5"}
                ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 scale-[1.02]"
                    : "text-gray-600 hover:bg-white/60 hover:text-orange-700 hover:shadow-md hover:scale-[1.02] backdrop-blur-sm"
                }
              `}
              title={collapsed ? item.name : undefined}
            >
              {/* Background gradient for hover effect */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
              )}

              <Icon
                className={`
                  flex-shrink-0 transition-all duration-200 relative z-10
                  ${collapsed ? "h-5 w-5" : "h-5 w-5"}
                  ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-orange-600 group-hover:scale-110"
                  }
                `}
              />

              {!collapsed && (
                <span className="ml-4 font-semibold tracking-tight relative z-10 truncate text-md">
                  {item.name}
                </span>
              )}

              {/* Active indicator */}
              {isActive && !collapsed && (
                <div className="absolute right-3 w-2 h-2 bg-white rounded-full shadow-sm" />
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-16 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.name}
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-100/50 p-3">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`
            group flex items-center w-full text-left rounded-xl transition-all duration-200 relative overflow-hidden
            ${collapsed ? "px-3 py-3 justify-center" : "px-4 py-3"}
            text-gray-600 hover:bg-white/60 hover:text-orange-700 hover:shadow-md backdrop-blur-sm
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={collapsed ? "Sign Out" : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />

          {isLoggingOut ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin flex-shrink-0 relative z-10" />
          ) : (
            <LogOut
              className={`
                flex-shrink-0 h-5 w-5 transition-all duration-200 relative z-10
                text-gray-400 group-hover:text-orange-600 group-hover:scale-110
              `}
            />
          )}

          {!collapsed && (
            <span className="ml-4 font-semibold tracking-tight relative z-10 truncate text-sm">
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </span>
          )}

          {/* Tooltip for collapsed state */}
          {collapsed && (
            <div className="absolute left-16 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
              Sign Out
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
