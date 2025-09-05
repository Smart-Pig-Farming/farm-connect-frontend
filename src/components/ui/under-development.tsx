import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface UnderDevelopmentProps {
  title: string;
  description: string;
  icon: LucideIcon;
  comingSoonFeatures?: string[];
}

export function UnderDevelopment({
  title,
  description,
  icon: Icon,
  comingSoonFeatures = [],
}: UnderDevelopmentProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="p-12 text-center max-w-2xl bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        {/* Icon with gradient background */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg ring-4 ring-orange-200/50">
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>

        {/* Coming Soon Features */}
        {comingSoonFeatures.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 p-6 rounded-2xl mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🚀 Coming Soon Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {comingSoonFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-gray-700 bg-white/60 rounded-lg p-3 shadow-sm"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full mr-3" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse" />
          <span className="font-semibold">Under Active Development</span>
        </div>
      </Card>
    </div>
  );
}
