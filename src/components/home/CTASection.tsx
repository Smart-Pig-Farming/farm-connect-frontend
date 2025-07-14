import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate } from "react-router-dom";

export function CTASection() {
  const ctaRef = useScrollAnimation();
  const navigate = useNavigate();

  return (
    <section
      ref={ctaRef.ref}
      className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-orange-500 to-orange-600 relative z-10"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
        <div
          className={`transition-all duration-1000 ${
            ctaRef.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
            Ready to Join the Community?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-orange-100 mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto px-4">
            Get unlimited access to discussions, best practices, and market
            insights.
          </p>

          <Button
            size="lg"
            onClick={() => navigate("/join")}
            className="bg-white text-orange-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl cursor-pointer text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 h-11 sm:h-12"
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </section>
  );
}
