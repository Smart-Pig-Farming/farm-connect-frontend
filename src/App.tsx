import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChatBubblesIcon,
  LightbulbIcon,
  TrendingUpIcon,
  ChevronDownIcon,
} from "@/components/ui/icons";
import { useScrollAnimation, useParallax } from "@/hooks/useScrollAnimation";

function App() {
  const [, setMousePosition] = useState({ x: 0, y: 0 });
  const parallaxOffset = useParallax();

  const heroRef = useScrollAnimation();
  const challengeRef = useScrollAnimation();
  const howItWorksRef = useScrollAnimation();
  const bestPracticesRef = useScrollAnimation();
  const ctaRef = useScrollAnimation();

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
      {/* Hero Section */}
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
        <div className="absolute top-6 left-6 z-20">
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="text-white">Farm</span>
            <span className="text-orange-400">Connect</span>
          </h1>
        </div>

        <div
          className={`relative z-10 text-center text-white px-4 max-w-4xl mx-auto transition-all duration-1000 ${
            heroRef.isVisible ? "animate-slide-up" : "opacity-0"
          }`}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Connect.</span>{" "}
            <span className="text-orange-400">Share.</span>{" "}
            <span className="text-blue-400">Grow.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Join a vibrant community of farmers, access proven best practices,
            and get the answers you need to grow your business.{" "}
            <span className="block mt-2">All in one place.</span>
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-6 md:flex md:justify-center md:items-center">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-xl hover:shadow-2xl cursor-pointer"
            >
              Join Us
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-800 transition-all duration-300 cursor-pointer"
            >
              Sign In
            </Button>
          </div>
        </div>

        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 scroll-indicator cursor-pointer"
          onClick={() => scrollToSection("how-it-works")}
        >
          <ChevronDownIcon className="text-white w-8 h-8 opacity-80 hover:opacity-100 transition-opacity duration-300" />
        </div>
      </section>

      {/* Challenge & Solution Section - Redesigned */}
      <section
        ref={challengeRef.ref}
        className="py-24 bg-gradient-to-br from-slate-50 via-white to-orange-50 relative z-10 overflow-hidden"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Background decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-orange-100 rounded-full opacity-30 blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-100 rounded-full opacity-30 blur-xl"></div>

          <div className="grid md:grid-cols-2 gap-16 items-center relative">
            {/* Problem Side */}
            <div
              className={`transition-all duration-1000 ${
                challengeRef.isVisible
                  ? "animate-slide-in-left"
                  : "opacity-0 translate-x-[-50px]"
              }`}
            >
              <div className="relative">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">😰</span>
                  </div>
                </div>

                <h2 className="text-4xl font-bold text-slate-800 mb-6 leading-tight">
                  Farming alone is{" "}
                  <span className="text-red-500 relative">
                    hard
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-3"
                      viewBox="0 0 100 12"
                      fill="none"
                    >
                      <path
                        d="M2 6C20 2, 40 10, 60 6C80 2, 90 8, 98 4"
                        stroke="#ef4444"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  .
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-slate-600">
                      Guesswork and outdated advice cost you money
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-slate-600">
                      Market surprises hurt your bottom line
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-slate-600">
                      Finding trustworthy info shouldn't be a full-time job
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution Side */}
            <div
              className={`transition-all duration-1000 delay-300 ${
                challengeRef.isVisible
                  ? "animate-slide-in-right"
                  : "opacity-0 translate-x-[50px]"
              }`}
            >
              <div className="relative">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🤝</span>
                  </div>
                </div>

                <h2 className="text-4xl font-bold text-slate-800 mb-6 leading-tight">
                  FarmConnect brings the{" "}
                  <span className="text-blue-600 relative">
                    experts
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-3"
                      viewBox="0 0 100 12"
                      fill="none"
                    >
                      <path
                        d="M2 6C20 2, 40 10, 60 6C80 2, 90 8, 98 4"
                        stroke="#2563eb"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>{" "}
                  to you.
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-slate-600">
                      Instant access to experienced farmers & vets
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-slate-600">
                      Share knowledge, learn from real experiences
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-slate-600">
                      Make confident decisions with community support
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="text-2xl">💡</div>
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      Join 2,500+ farmers
                    </p>
                    <p className="text-xs text-blue-600">
                      Already growing together
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        ref={howItWorksRef.ref}
        className="py-24 bg-white relative z-10"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div
            className={`text-center mb-20 transition-all duration-1000 ${
              howItWorksRef.isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              How It Works
            </h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto mb-6"></div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Three simple steps to transform your farming journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div
              className={`text-center transition-all duration-1000 ${
                howItWorksRef.isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <ChatBubblesIcon
                    className="text-orange-500 w-12 h-12"
                    size={48}
                  />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-800">
                  Ask & Discuss
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Post questions in the community feed. From disease control to
                  feed prices, get real-time answers from people who understand
                  your challenges.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`text-center transition-all duration-1000 delay-200 ${
                howItWorksRef.isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <LightbulbIcon
                    className="text-blue-500 w-12 h-12"
                    size={48}
                  />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-800">
                  Learn Best Practices
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Explore our library of expert-vetted guides covering 8 key
                  areas of pig farming, from breeding to business finance.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`text-center transition-all duration-1000 delay-400 ${
                howItWorksRef.isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <TrendingUpIcon
                    className="text-green-500 w-12 h-12"
                    size={48}
                  />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-800">
                  Find Opportunities
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Discover new market opportunities, connect with suppliers, and
                  stay ahead of industry trends to grow your farm and your
                  profits.
                </p>
              </div>
            </div>
          </div>

          {/* Call-to-action */}
          <div className="text-center mt-16">
            <div
              className={`transition-all duration-1000 delay-600 ${
                howItWorksRef.isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <p className="text-slate-600 mb-6">Ready to get started?</p>
              <Button
                size="lg"
                className="bg-orange-600 hover:from-orange-600 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                Join the Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices Preview Section - Redesigned with Card Stack */}
      <section
        ref={bestPracticesRef.ref}
        className="py-24 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 relative z-10 overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 max-w-6xl">
          <div
            className={`text-center mb-20 transition-all duration-1000 ${
              bestPracticesRef.isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Knowledge You Can Build On.
            </h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto mb-6"></div>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Discover proven strategies and best practices from industry
              experts and experienced farmers.
            </p>
          </div>

          {/* Best Practices Cards - Expanded Layout */}
          <div className="relative max-w-6xl mx-auto">
            {/* Mobile: Vertical Stack */}
            <div className="md:hidden flex flex-col gap-8">
              {/* Card 1 - Feeding & Nutrition */}
              <div
                className={`transition-all duration-700 ${
                  bestPracticesRef.isVisible
                    ? "animate-fade-in-up"
                    : "opacity-0"
                }`}
              >
                <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6 shadow-2xl hover:shadow-green-500/30 transition-shadow duration-300 cursor-pointer">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Feeding & Nutrition
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Cost-Effective Rations Using Local Resources
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    Learn how to supplement standard feed with banana peels,
                    sweet potato vines, and other local ingredients to reduce
                    costs while maintaining nutrition.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🌾</span>
                    </div>
                    <span className="text-slate-400 text-xs">5 min read</span>
                  </div>
                </div>
              </div>

              {/* Card 2 - Disease Control */}
              <div
                className={`transition-all duration-700 delay-200 ${
                  bestPracticesRef.isVisible
                    ? "animate-fade-in-up"
                    : "opacity-0"
                }`}
              >
                <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl border border-slate-600/50 p-6 shadow-xl hover:shadow-red-500/30 transition-shadow duration-300 cursor-pointer">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Disease Control
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    A Farmer's Guide to Biosecurity
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    Essential protocols to protect your farm from disease
                    outbreaks and maintain healthy livestock. Implement
                    quarantine procedures and vaccination schedules.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">�️</span>
                    </div>
                    <span className="text-slate-400 text-xs">6 min read</span>
                  </div>
                </div>
              </div>

              {/* Card 3 - Marketing & Finance */}
              <div
                className={`transition-all duration-700 delay-400 ${
                  bestPracticesRef.isVisible
                    ? "animate-fade-in-up"
                    : "opacity-0"
                }`}
              >
                <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl border border-slate-500/30 p-6 shadow-lg hover:shadow-blue-500/30 transition-shadow duration-300 cursor-pointer">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Marketing & Finance
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Understanding Market Price Cycles
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    Master market timing and pricing strategies to maximize your
                    profits throughout the year. Learn when to sell and predict
                    price fluctuations.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">💰</span>
                    </div>
                    <span className="text-slate-400 text-xs">7 min read</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Expanded Side-by-Side Layout */}
            <div className="hidden md:flex justify-center items-start gap-8 min-h-[400px]">
              {/* Card 1 - Marketing & Finance (Left) */}
              <div
                className={`transform transition-all duration-700 ease-out ${
                  bestPracticesRef.isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-20"
                }`}
              >
                <div className="w-80 h-96 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl border border-slate-500/30 p-6 shadow-lg hover:shadow-blue-500/30 transition-shadow duration-300 cursor-pointer">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Marketing & Finance
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Understanding Market Price Cycles
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    Master market timing and pricing strategies to maximize your
                    profits throughout the year. Learn when to sell, how to
                    predict price fluctuations, and optimize your revenue
                    streams.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">�</span>
                    </div>
                    <span className="text-slate-400 text-xs">7 min read</span>
                  </div>
                </div>
              </div>

              {/* Card 2 - Feeding & Nutrition (Center) */}
              <div
                className={`transform transition-all duration-700 ease-out delay-200 ${
                  bestPracticesRef.isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-20"
                }`}
              >
                <div className="w-80 h-96 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-6 shadow-2xl hover:shadow-green-500/30 transition-shadow duration-300 cursor-pointer">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Feeding & Nutrition
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Cost-Effective Rations Using Local Resources
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    Learn how to supplement standard feed with banana peels,
                    sweet potato vines, and other local ingredients to reduce
                    costs while maintaining nutrition. Discover feeding
                    schedules and portion control techniques.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🌾</span>
                    </div>
                    <span className="text-slate-400 text-xs">5 min read</span>
                  </div>
                </div>
              </div>

              {/* Card 3 - Disease Control (Right) */}
              <div
                className={`transform transition-all duration-700 ease-out delay-400 ${
                  bestPracticesRef.isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-20"
                }`}
              >
                <div className="w-80 h-96 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl border border-slate-600/50 p-6 shadow-xl hover:shadow-red-500/30 transition-shadow duration-300 cursor-pointer">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Disease Control
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    A Farmer's Guide to Biosecurity
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    Essential protocols to protect your farm from disease
                    outbreaks and maintain healthy livestock. Implement
                    quarantine procedures, vaccination schedules, and visitor
                    management systems.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🛡️</span>
                    </div>
                    <span className="text-slate-400 text-xs">6 min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        ref={ctaRef.ref}
        className="py-24 bg-gradient-to-br from-orange-500 to-orange-600 relative z-10"
      >
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div
            className={`transition-all duration-1000 ${
              ctaRef.isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Join the Community?
            </h2>
            <p className="text-xl text-orange-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              Your free account gives you unlimited access to discussions, best
              practices, and market insights. Sign up in 60 seconds.
            </p>

            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl cursor-pointer"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
