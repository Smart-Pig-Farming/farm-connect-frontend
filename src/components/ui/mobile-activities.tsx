import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MobileActivity {
  action: string;
  points: string;
  description: string;
  icon: LucideIcon;
  buttonAction: string;
  onClick: () => void;
}

interface MobileActivitiesProps {
  activities: MobileActivity[];
}

export const MobileActivities: React.FC<MobileActivitiesProps> = ({ activities }) => {
  return (
    <div className="sm:hidden space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-black text-gray-900 mb-1">Earn Points</h2>
        <p className="text-sm text-gray-600">Engage and grow your expertise</p>
      </div>

      {/* Mobile Activity Cards - Compact List */}
      <div className="space-y-3">
        {activities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
              onClick={activity.onClick}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-orange-600" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {activity.action}
                    </h3>
                    <span className="flex-shrink-0 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                      {activity.points}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {activity.description}
                  </p>
                  
                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      activity.onClick();
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 text-sm"
                  >
                    {activity.buttonAction}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
