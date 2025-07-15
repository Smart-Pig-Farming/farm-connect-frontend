import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation, useParallax } from "@/hooks/useScrollAnimation";

interface HeroBackgroundProps {
  children: ReactNode;
  showParallax?: boolean;
  className?: string;
}

export function HeroBackground({
  children,
  showParallax = true,
  className = "",
}: HeroBackgroundProps) {
  const parallaxOffset = useParallax();
  const backgroundRef = useScrollAnimation();
  const navigate = useNavigate();

  return (
    <section
      ref={backgroundRef.ref}
      className={`relative min-h-screen parallax-container bg-cover bg-center bg-fixed flex items-center justify-center ${className}`}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/hero.png')`,
        transform: showParallax
          ? `translateY(${parallaxOffset * 0.5}px)`
          : "none",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-600/20"></div>
      <div className="absolute inset-0 bg-gradient-radial from-black/40 via-black/20 to-transparent"></div>

      {/* Logo */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
        <h1
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={() => navigate("/")}
        >
          <span className="text-white">Farm</span>
          <span className="text-orange-400">Connect</span>
        </h1>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </section>
  );
}
