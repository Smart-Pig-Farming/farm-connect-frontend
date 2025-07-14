import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@/components/ui/icons";
import { useScrollAnimation, useParallax } from "@/hooks/useScrollAnimation";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  onScrollToSection: (sectionId: string) => void;
}

export function HeroSection({ onScrollToSection }: HeroSectionProps) {
  const parallaxOffset = useParallax();
  const heroRef = useScrollAnimation();
  const navigate = useNavigate();

  return (
    <section
      ref={heroRef.ref}
      className="relative min-h-screen parallax-container bg-cover bg-center bg-fixed flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/hero.png')`,
        transform: `translateY(${parallaxOffset * 0.5}px)`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-600/20"></div>
      <div className="absolute inset-0 bg-gradient-radial from-black/40 via-black/20 to-transparent"></div>
      {/* Logo */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
          <span className="text-white">Farm</span>
          <span className="text-orange-400">Connect</span>
        </h1>
      </div>{" "}
      <div
        className={`relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto transition-all duration-1000 ${
          heroRef.isVisible ? "animate-slide-up" : "opacity-0"
        }`}
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
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 scroll-indicator cursor-pointer"
        onClick={() => onScrollToSection("how-it-works")}
      >
        <ChevronDownIcon className="text-white w-8 h-8 opacity-80 hover:opacity-100 transition-opacity duration-300" />
      </div>
    </section>
  );
}
