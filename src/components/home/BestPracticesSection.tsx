import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function BestPracticesSection() {
  const bestPracticesRef = useScrollAnimation();

  return (
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
            Discover proven strategies and best practices from industry experts
            and experienced farmers.
          </p>
        </div>

        {/* Best Practices Cards - Expanded Layout */}
        <div className="relative max-w-6xl mx-auto">
          {/* Mobile: Vertical Stack */}
          <div className="md:hidden flex flex-col gap-8">
            {/* Card 1 - Feeding & Nutrition */}
            <div
              className={`transition-all duration-700 ${
                bestPracticesRef.isVisible ? "animate-fade-in-up" : "opacity-0"
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
                  Learn how to supplement standard feed with banana peels, sweet
                  potato vines, and other local ingredients to reduce costs
                  while maintaining nutrition.
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
                bestPracticesRef.isVisible ? "animate-fade-in-up" : "opacity-0"
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
                  outbreaks and maintain healthy livestock. Implement quarantine
                  procedures and vaccination schedules.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🛡️</span>
                  </div>
                  <span className="text-slate-400 text-xs">6 min read</span>
                </div>
              </div>
            </div>

            {/* Card 3 - Marketing & Finance */}
            <div
              className={`transition-all duration-700 delay-400 ${
                bestPracticesRef.isVisible ? "animate-fade-in-up" : "opacity-0"
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
                  predict price fluctuations, and optimize your revenue streams.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">💰</span>
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
                  Learn how to supplement standard feed with banana peels, sweet
                  potato vines, and other local ingredients to reduce costs
                  while maintaining nutrition. Discover feeding schedules and
                  portion control techniques.
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
                  outbreaks and maintain healthy livestock. Implement quarantine
                  procedures, vaccination schedules, and visitor management
                  systems.
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
  );
}
