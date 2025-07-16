import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface HeaderProps {
  sidebarCollapsed: boolean;
  isMobile?: boolean;
}

export function Header({ sidebarCollapsed, isMobile = false }: HeaderProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <header
      className={`
        sticky top-0 z-40 backdrop-blur-xl bg-white/85 
        border-b border-white/20 shadow-sm
        transition-all duration-300 
        ${sidebarCollapsed ? "lg:pl-3" : "lg:pl-4"}
        ${isMobile ? "pl-4" : ""}
      `}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left Section - Logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile Logo */}
          <div className="lg:hidden">
            <Logo size="sm" onClick={() => navigate("/dashboard")} />
          </div>

          {/* Desktop Logo */}
          <div className="hidden lg:block">
            <Logo size="sm" onClick={() => navigate("/dashboard")} />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2.5 text-gray-500 hover:text-orange-600 hover:bg-white/60 rounded-xl transition-all duration-200 relative backdrop-blur-sm group">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/50">
                <span className="text-[10px] text-white font-bold">3</span>
              </span>
              <div className="absolute inset-0 rounded-xl bg-orange-500/10 scale-0 group-hover:scale-100 transition-transform duration-200" />
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-xl hover:bg-white/60 transition-all duration-200 group backdrop-blur-sm"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md ring-2 ring-white/50">
                <span className="text-white text-xs sm:text-sm font-bold">
                  JD
                </span>
              </div>

              <div className="hidden sm:flex items-center space-x-2">
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-700 leading-tight">
                    John Doe
                  </div>
                  <div className="text-xs text-gray-500 leading-tight">
                    Farm Manager
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-all duration-300 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Mobile only chevron */}
              <div className="sm:hidden">
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-all duration-300 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {/* Enhanced Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 sm:w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-100/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">JD</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm leading-tight">
                        John Doe
                      </div>
                      <div className="text-sm text-gray-500 truncate leading-tight">
                        john@farmconnect.com
                      </div>
                      <div className="text-xs text-orange-600 font-medium mt-1">
                        Farm Manager
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/dashboard/profile");
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-orange-50/80 hover:text-orange-700 transition-colors group"
                  >
                    <User className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 transition-colors group"
                  >
                    <LogOut className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
