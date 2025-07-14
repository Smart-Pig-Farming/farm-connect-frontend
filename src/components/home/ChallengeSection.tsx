import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function ChallengeSection() {
  const challengeRef = useScrollAnimation();

  return (
    <section
      ref={challengeRef.ref}
      className="py-24 bg-gradient-to-br from-slate-50 via-white to-orange-50 relative z-10 overflow-hidden"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-100 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-100 rounded-full opacity-30 blur-xl"></div>

        <div className="grid md:grid-cols-2 gap-16 items-start relative">
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
              <div className="mb-8">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-4xl">😰</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-4xl font-bold text-slate-800 mb-4 leading-tight">
                  Farming alone is{" "}
                  <span className="text-red-500 relative inline-block">
                    hard
                    <svg
                      className="absolute -bottom-1 left-0 w-full h-3"
                      viewBox="0 0 100 12"
                      fill="none"
                      preserveAspectRatio="none"
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
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-slate-600 leading-relaxed">
                    Guesswork and outdated advice cost you money
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-slate-600 leading-relaxed">
                    Market surprises hurt your bottom line
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-slate-600 leading-relaxed">
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
              <div className="mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🤝</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-4xl font-bold text-slate-800 mb-4 leading-tight">
                  FarmConnect brings the{" "}
                  <span className="text-blue-600 relative inline-block">
                    experts
                    <svg
                      className="absolute -bottom-1 left-0 w-full h-3"
                      viewBox="0 0 100 12"
                      fill="none"
                      preserveAspectRatio="none"
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
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-slate-600 leading-relaxed">
                    Instant access to experienced farmers & vets
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-slate-600 leading-relaxed">
                    Share knowledge, learn from real experiences
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-slate-600 leading-relaxed">
                    Make confident decisions with community support
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-400 shadow-sm">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💡</span>
                </div>
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
  );
}
