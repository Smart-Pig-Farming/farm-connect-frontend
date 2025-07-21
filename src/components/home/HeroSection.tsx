import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@/components/ui/icons";
import { HeroBackground } from "@/components/ui/hero-background";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  onScrollToSection: (sectionId: string) => void;
}

export function HeroSection({ onScrollToSection }: HeroSectionProps) {
  const heroRef = useScrollAnimation();
  const navigate = useNavigate();

  return (
    <HeroBackground>
      {/* Vertical "How It Works" Tab - Left Side */}
      <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-20">
        <button
          onClick={() => onScrollToSection("how-it-works")}
          className="group cursor-pointer transition-all duration-300 hover:scale-105"
          aria-label="Learn how our platform works"
        >
          <div
            className="bg-gradient-to-b from-orange-500 to-orange-600 rounded-r-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:from-orange-600 group-hover:to-orange-700"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            <div className="p-3">
              <span className="text-white font-semibold text-xs md:text-sm lg:text-base tracking-[0.2em] group-hover:tracking-[0.25em] transition-all duration-300">
                HOW IT WORKS
              </span>
            </div>
          </div>
        </button>
      </div>

      <div
        className={`text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto transition-all duration-1000 ${
          heroRef.isVisible ? "animate-slide-up" : "opacity-0"
        }`}
        ref={heroRef.ref}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight">
          <span className="text-white">Connect.</span>{" "}
          <span className="text-orange-400">Share.</span>{" "}
          <span className="text-blue-400">Grow.</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 text-gray-200 max-w-3xl mx-auto leading-relaxed">
          Join a vibrant community of farmers, access proven best practices, and
          get the answers you need to grow your business.{" "}
          <span className="block mt-2">All in one place.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full max-w-md sm:max-w-none mx-auto">
          <Button
            size="lg"
            onClick={() => navigate("/join")}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white shadow-xl hover:shadow-2xl cursor-pointer text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-3 h-11 sm:h-12"
          >
            Join Us
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/signin")}
            className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-800 transition-all duration-300 cursor-pointer text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-3 h-11 sm:h-12"
          >
            Sign In
          </Button>
        </div>
      </div>
      <div
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 scroll-indicator cursor-pointer"
        onClick={() => onScrollToSection("how-it-works")}
      >
        <ChevronDownIcon className="text-white w-8 h-8 opacity-80 hover:opacity-100 transition-opacity duration-300" />
      </div>
    </HeroBackground>
  );
}
