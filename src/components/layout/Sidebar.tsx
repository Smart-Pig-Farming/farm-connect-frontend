import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Home,
  MessageSquare,
  BookOpen,
  Users,
  User,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useLogoutMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { usePermissions } from "@/hooks/usePermissions";

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

const baseNavigation: NavigationItem[] = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Discussions", href: "/dashboard/discussions", icon: MessageSquare },
  { name: "Best Practices", href: "/dashboard/best-practices", icon: BookOpen },
  {
    name: "User Management",
    href: "/dashboard/users",
    icon: Users,
    permission: "MANAGE:USERS",
  },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

interface SidebarProps {
  collapsed: boolean; // retained for width styling
  isMobile?: boolean;
}

export function Sidebar({ collapsed, isMobile = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { hasPermission } = usePermissions();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Filter navigation items based on user permissions
  const navigation = baseNavigation.filter((item) => {
    if (item.permission) {
      return hasPermission(item.permission);
    }
    return true; // Show items without permission requirements
  });

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
        transition-all duration-300 ease-in-out z-40
        pt-16
        ${collapsed ? "lg:w-16" : "lg:w-60"}
      `}
    >
      {/* (Branding removed; header provides logo) */}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard/best-practices"
              ? location.pathname.startsWith("/dashboard/best-practices")
              : location.pathname === item.href;
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
