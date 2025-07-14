import { Button } from "@/components/ui/button";
import {
  ChatBubblesIcon,
  LightbulbIcon,
  TrendingUpIcon,
} from "@/components/ui/icons";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function HowItWorksSection() {
  const howItWorksRef = useScrollAnimation();

  return (
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
                <LightbulbIcon className="text-blue-500 w-12 h-12" size={48} />
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
                Explore our library of expert-vetted guides covering 8 key areas
                of pig farming, from breeding to business finance.
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
  );
}
