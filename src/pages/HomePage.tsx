import { useEffect, useState } from "react";
import {
  HeroSection,
  ChallengeSection,
  HowItWorksSection,
  BestPracticesSection,
  CTASection,
} from "@/components/home";

const HomePage = () => {
  const [, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Poppins']">
      <HeroSection onScrollToSection={scrollToSection} />
      <ChallengeSection />
      <HowItWorksSection />
      <BestPracticesSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
