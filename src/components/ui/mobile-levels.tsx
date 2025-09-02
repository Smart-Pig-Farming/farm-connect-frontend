import React from "react";
import { Award, Zap, ArrowRight } from "lucide-react";

interface MobileLevelsProps {
  handleNavigateToDiscussions: () => void;
}

export const MobileLevels: React.FC<MobileLevelsProps> = ({
  handleNavigateToDiscussions,
}) => {
  const levels = [
    { number: 1, name: "Newcomer", points: "0-20 pts", color: "orange" },
    { number: 2, name: "Amateur", points: "21-149 pts", color: "amber" },
    { number: 3, name: "Contributor", points: "150-299 pts", color: "rose" },
    { number: 4, name: "Knight", points: "300-599 pts", color: "yellow" },
    {
      number: 5,
      name: "Expert",
      points: "600+ pts",
      color: "orange",
      special: "Gateway to endgame",
    },
  ];

  return (
    <div className="sm:hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 mb-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <Award className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">
            Level Up Your Game
          </h2>
          <p className="text-sm text-gray-600">
            Every interaction builds your expertise
          </p>
        </div>
      </div>

      {/* Mobile Levels List */}
      <div className="space-y-3 mb-6">
        {levels.map((level) => (
          <div
            key={level.number}
            className={`bg-white rounded-lg p-3 border border-${level.color}-100 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg bg-${level.color}-100 flex items-center justify-center`}
                >
                  <span className={`text-xs font-bold text-${level.color}-600`}>
                    {level.number}
                  </span>
                </div>
                <div>
                  <div className={`text-sm font-bold text-${level.color}-700`}>
                    {level.name}
                  </div>
                  {level.special && (
                    <div className={`text-xs text-${level.color}-500`}>
                      {level.special}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-gray-600">
                  {level.points}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile CTA */}
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-4">
          After Expert, unlock Prestige tiers via higher points and Moderator
          posts.
        </p>
        <button
          onClick={handleNavigateToDiscussions}
          className="w-full bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
        >
          <Zap className="w-4 h-4" />
          Get Started Now
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
