import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function CTASection() {
  const ctaRef = useScrollAnimation();

  return (
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
            Get unlimited access to discussions, best practices, and market
            insights.
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
  );
}
