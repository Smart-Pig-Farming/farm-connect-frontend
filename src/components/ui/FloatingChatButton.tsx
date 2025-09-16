import { MessageCircle, ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

interface FloatingChatButtonProps {
  onClick: () => void;
}

interface ChatButtonState {
  isMinimized: boolean;
  isHidden: boolean;
  position: "bottom-right" | "bottom-left" | "side-right" | "side-left";
  bottomOffset: number;
  rightOffset: number;
  leftOffset: number;
}

export function FloatingChatButton({ onClick }: FloatingChatButtonProps) {
  const [state, setState] = useState<ChatButtonState>({
    isMinimized: false,
    isHidden: false,
    position: "bottom-right",
    bottomOffset: 96,
    rightOffset: 24,
    leftOffset: 24,
  });

  const rafRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef<number>(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Calculate dynamic positioning based on mobile navigation and screen size
  const calculatePosition = useCallback(() => {
    const tab = document.getElementById("mobile-tabbar");
    const safeArea = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--safe-area-bottom")
        .replace("px", "") || "0",
      10
    );

    const tabHeight = tab ? tab.getBoundingClientRect().height : 0;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 1024; // lg breakpoint
    const isSmallMobile = viewportWidth < 640; // sm breakpoint

    // Always position on the right side with smart bottom positioning
    const newPosition: ChatButtonState["position"] = "bottom-right";
    let bottomOffset = 24;
    let rightOffset = 24;
    const leftOffset = 24; // Keep for state consistency

    if (isMobile && tab) {
      // Mobile: Position above mobile tab bar
      const gap = isSmallMobile ? 12 : 16;
      bottomOffset = Math.max(24, Math.ceil(tabHeight + safeArea + gap));

      // Adjust right offset for very small screens to ensure visibility
      rightOffset = isSmallMobile ? 16 : 24;
    } else {
      // Desktop: Standard positioning
      bottomOffset = 24;
      rightOffset = 24;
    }

    // On landscape mobile, adjust vertical positioning to avoid keyboard area
    if (isMobile && viewportHeight < 500 && viewportWidth > 600) {
      // Keep bottom-right but adjust vertical position for landscape
      bottomOffset = Math.max(viewportHeight * 0.15, 80);
    }

    setState((prev) => ({
      ...prev,
      position: newPosition,
      bottomOffset,
      rightOffset,
      leftOffset,
    }));
  }, []);

  // Handle scroll behavior for better mobile UX
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);

    if (scrollDifference > 5) {
      setIsScrolling(true);

      // Hide button when scrolling down on mobile
      if (
        window.innerWidth < 1024 &&
        currentScrollY > lastScrollY.current &&
        currentScrollY > 100
      ) {
        setState((prev) => ({ ...prev, isHidden: true }));
      }

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Show button again after scroll stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setState((prev) => ({ ...prev, isHidden: false }));
      }, 150);
    }

    lastScrollY.current = currentScrollY;
  }, []);

  // Mount effect
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Initial calculation
    rafRef.current = window.requestAnimationFrame(calculatePosition);

    // Recalculate on resize and orientation change
    const onResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = window.requestAnimationFrame(calculatePosition);
    };

    // Add scroll listener for mobile behavior
    const throttledScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = window.requestAnimationFrame(handleScroll);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("scroll", throttledScroll, { passive: true });

    // Observe size changes to the tabbar itself
    const tab = document.getElementById("mobile-tabbar");
    let ro: ResizeObserver | null = null;
    if (tab && "ResizeObserver" in window) {
      ro = new ResizeObserver(calculatePosition);
      ro.observe(tab);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("scroll", throttledScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (ro && tab) ro.unobserve(tab);
    };
  }, [calculatePosition, handleScroll, isMounted]);

  // Handle minimize toggle for mobile
  const toggleMinimized = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setState((prev) => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  // Determine positioning styles - always bottom-right
  const getPositionStyles = () => {
    return {
      position: "fixed" as const,
      bottom: state.bottomOffset,
      right: state.rightOffset,
      zIndex: 40,
    };
  };

  // Don't render if hidden or not mounted
  if (state.isHidden || !isMounted) {
    return null;
  }

  const isMobileView =
    typeof window !== "undefined" && window.innerWidth < 1024;

  // Minimized state for mobile
  if (state.isMinimized && isMobileView) {
    return (
      <button
        onClick={toggleMinimized}
        style={getPositionStyles()}
        className="fixed z-40 w-10 h-6 bg-gradient-to-r from-orange-500/90 to-red-500/90 hover:from-orange-600 hover:to-red-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 hover:cursor-pointer flex items-center justify-center group backdrop-blur-sm"
        aria-label="Expand chat button"
      >
        <ChevronLeft className="h-3 w-3" />
      </button>
    );
  }

  // Get tooltip positioning based on button position
  // Tooltip always positioned to the left since button is always on the right
  const getTooltipClasses = () => {
    return "absolute right-full mr-3 px-3 py-2 bg-gray-900 dark:bg-slate-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none";
  };

  const getTooltipArrow = () => {
    return (
      <div className="absolute top-1/2 left-full w-0 h-0 border-l-4 border-l-gray-900 dark:border-l-slate-700 border-t-4 border-t-transparent border-b-4 border-b-transparent transform -translate-y-1/2"></div>
    );
  };

  return (
    <div className="relative">
      {/* Main chat button */}
      <button
        onClick={onClick}
        style={getPositionStyles()}
        className="fixed z-40 w-12 h-12 sm:w-14 sm:h-14 lg:w-14 lg:h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:cursor-pointer flex items-center justify-center group"
        aria-label="Open chat assistant"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200 group-hover:scale-105" />

        {/* Subtle pulse animation ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-pulse opacity-10"></div>

        {/* Tooltip with responsive positioning */}
        <div className={getTooltipClasses()}>
          Ask a question
          {getTooltipArrow()}
        </div>
      </button>

      {/* Mobile minimize button - only show on small screens */}
      {isMobileView && !isScrolling && (
        <button
          onClick={toggleMinimized}
          style={{
            position: "fixed" as const,
            right: state.rightOffset - 8,
            bottom: (state.bottomOffset as number) + 50,
            zIndex: 41,
          }}
          className="fixed z-41 w-6 h-6 bg-gray-600/80 hover:bg-gray-700 text-white rounded-full shadow transition-all duration-200 hover:cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100"
          aria-label="Minimize chat button"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
