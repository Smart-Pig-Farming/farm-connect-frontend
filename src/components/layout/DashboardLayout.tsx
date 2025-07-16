import {
  type ReactNode,
  useState,
  useEffect,
  Component,
  type ErrorInfo,
} from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileTabBar } from "./MobileTabBar";

interface DashboardLayoutProps {
  children: ReactNode;
}

// Simple Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-4">
              We encountered an error while loading this page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Responsive behavior for sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Auto-collapse sidebar on smaller screens
      if (window.innerWidth < 1280 && window.innerWidth >= 1024) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Initialize dashboard
    const timer = setTimeout(() => setIsLoading(false), 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-100 antialiased">
      {/* Enhanced Background Pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.15'%3E%3Ccircle cx='8' cy='8' r='1.5'/%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3Ccircle cx='72' cy='72' r='1.5'/%3E%3Cpath d='M20 20h2v2h-2zM60 60h2v2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Enhanced Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-tr from-white/40 via-transparent to-orange-50/30 pointer-events-none" />

      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-orange-500 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>

      <Header sidebarCollapsed={sidebarCollapsed} isMobile={isMobile} />

      <div className="flex relative">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={setSidebarCollapsed}
          isMobile={isMobile}
        />

        <main
          id="main-content"
          role="main"
          aria-label="Dashboard content"
          className={`
            flex-1 relative transition-all duration-300 ease-in-out
            px-4 py-6 pb-24
            sm:px-6 sm:py-8 sm:pb-24
            lg:px-8 lg:py-8 lg:pb-8
            ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"}
            ${isMobile ? "ml-0" : ""}
            min-h-[calc(100vh-4rem)]
            focus:outline-none
          `}
          tabIndex={-1}
        >
          {/* Content Container with Responsive Max Width */}
          <div className="max-w-7xl mx-auto w-full">
            {/* Content Wrapper with Error Boundary */}
            <div className="space-y-6 lg:space-y-8">
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
          </div>
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
}
