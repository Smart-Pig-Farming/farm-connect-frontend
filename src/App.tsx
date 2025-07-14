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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-white hover:text-orange-300 underline text-lg transition-colors duration-300 cursor-pointer"
            >
              Learn How It Works
            </button>
          </div>
        </div>

        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 scroll-indicator cursor-pointer"
          onClick={() => scrollToSection("how-it-works")}
        >
          <ChevronDownIcon className="text-white w-8 h-8 opacity-80 hover:opacity-100 transition-opacity duration-300" />
        </div>
      </section>

      {/* Challenge & Solution Section */}
      <section ref={challengeRef.ref} className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div
              className={`transition-all duration-1000 ${
                challengeRef.isVisible
                  ? "animate-slide-in-left"
                  : "opacity-0 translate-x-[-50px]"
              }`}
            >
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                Farming alone is <span className="text-orange-500">hard</span>.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Guesswork, outdated advice, and market surprises can hurt your
                bottom line. Finding trustworthy information shouldn't be
                another full-time job.
              </p>
            </div>

            <div
              className={`transition-all duration-1000 delay-300 ${
                challengeRef.isVisible
                  ? "animate-slide-in-right"
                  : "opacity-0 translate-x-[50px]"
              }`}
            >
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                FarmConnect brings the{" "}
                <span className="text-blue-600">experts</span> to you.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Get instant access to a private network of experienced farmers,
                veterinarians, and market specialists. Share what you know,
                learn what you don't, and make decisions with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        ref={howItWorksRef.ref}
        className="py-24 bg-slate-50 relative z-10"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div
            className={`text-center mb-20 transition-all duration-1000 ${
              howItWorksRef.isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              How It Works
            </h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto animate-draw-line"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div
              className={`text-center group transition-all duration-1000 cursor-pointer ${
                howItWorksRef.isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-orange-200 transition-colors duration-300">
                  <ChatBubblesIcon
                    className="text-orange-500 w-10 h-10"
                    size={40}
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Ask & Discuss
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Post questions in the community feed. From disease control to
                feed prices, get real-time answers from people who understand
                your challenges.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className={`text-center group transition-all duration-1000 delay-200 cursor-pointer ${
                howItWorksRef.isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors duration-300">
                  <LightbulbIcon
                    className="text-blue-500 w-10 h-10"
                    size={40}
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Learn Best Practices
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Explore our library of expert-vetted guides covering 8 key areas
                of pig farming, from breeding to business finance.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className={`text-center group transition-all duration-1000 delay-400 cursor-pointer ${
                howItWorksRef.isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors duration-300">
                  <TrendingUpIcon
                    className="text-green-600 w-10 h-10"
                    size={40}
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
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
      </section>

      {/* Best Practices Preview Section - Redesigned */}
      <section
        ref={bestPracticesRef.ref}
        className="py-24 bg-gradient-to-br from-orange-50 to-slate-100 relative z-10"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div
            className={`text-center mb-20 transition-all duration-1000 ${
              bestPracticesRef.isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Expert Knowledge at Your Fingertips
            </h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto mb-4"></div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover proven strategies and best practices from industry
              experts and experienced farmers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Practice Card 1 */}
            <Card
              className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-green-500 ${
                bestPracticesRef.isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <CardHeader className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Feeding & Nutrition
                  </span>
                </div>
                <CardTitle className="text-slate-800 group-hover:text-green-600 transition-colors">
                  Cost-Effective Local Feed Resources
                </CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Learn how to supplement standard feed with banana peels, sweet
                  potato vines, and other local ingredients to reduce costs
                  while maintaining nutrition.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Practice Card 2 */}
            <Card
              className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-red-500 delay-200 ${
                bestPracticesRef.isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <CardHeader className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Disease Control
                  </span>
                </div>
                <CardTitle className="text-slate-800 group-hover:text-red-600 transition-colors">
                  Essential Biosecurity Protocols
                </CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Protect your farm from disease outbreaks with proven
                  biosecurity measures and early detection strategies.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Practice Card 3 */}
            <Card
              className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500 delay-400 ${
                bestPracticesRef.isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <CardHeader className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Marketing & Finance
                  </span>
                </div>
                <CardTitle className="text-slate-800 group-hover:text-blue-600 transition-colors">
                  Understanding Market Cycles
                </CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Master market timing and pricing strategies to maximize your
                  profits throughout the year.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white cursor-pointer"
            >
              Explore All Best Practices
            </Button>
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
