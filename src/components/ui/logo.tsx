import { Sprout, Users } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function Logo({ size = "md", className = "", onClick }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl md:text-2xl",
    lg: "text-2xl md:text-3xl lg:text-4xl",
  };

  return (
    <div
      className={`flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200 ${className}`}
      onClick={onClick}
    >
      {/* Icon container with gradient background */}
      <div className="relative">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
          <div className="relative">
            <Sprout className="w-4 h-4 md:w-5 md:h-5 text-white" />
            <Users className="w-2 h-2 md:w-3 md:h-3 text-white/80 absolute -bottom-0.5 -right-0.5" />
          </div>
        </div>
      </div>

      {/* Text logo */}
      <h1 className={`font-bold tracking-tight ${sizeClasses[size]}`}>
        <span className="text-gray-900 font-semibold">Farm</span>
        <span className="text-orange-500 font-bold">Connect</span>
      </h1>
    </div>
  );
}
