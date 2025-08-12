import { CheckCircle, Trash2, AlertCircle, User, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type PostModerationStatus,
  type ModerationAction,
  formatTimeAgo,
  getPostData,
} from "@/data/moderation";

interface ModerationHistoryCardProps {
  moderationStatus: PostModerationStatus & { action: ModerationAction };
}

export function ModerationHistoryCard({
  moderationStatus,
}: ModerationHistoryCardProps) {
  const { postId, action, reportCount } = moderationStatus;

  // Get post data from centralized mock data
  const mockPost = getPostData(postId);

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "retained":
        return "text-green-700 bg-green-100 border-green-200 hover:bg-green-200";
      case "deleted":
        return "text-red-700 bg-red-100 border-red-200 hover:bg-red-200";
      case "warned":
        return "text-yellow-700 bg-yellow-100 border-yellow-200 hover:bg-yellow-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200 hover:bg-gray-200";
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "retained":
        return <CheckCircle className="h-4 w-4" />;
      case "deleted":
        return <Trash2 className="h-4 w-4" />;
      case "warned":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getDecisionLabel = (decision: string) => {
    switch (decision) {
      case "retained":
        return "RETAINED";
      case "deleted":
        return "DELETED";
      case "warned":
        return "WARNED";
      default:
        return decision.toUpperCase();
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <div className="p-6">
        {/* Header with enhanced visual hierarchy */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                "text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm",
                getDecisionColor(action.decision)
              )}
            >
              {getDecisionIcon(action.decision)}
              <span className="ml-2">{getDecisionLabel(action.decision)}</span>
            </Badge>
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            {formatTimeAgo(action.timestamp)}
          </div>
        </div>

        {/* Post Content with Modern Design */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200/30 mb-5">
          {/* Post Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {mockPost.author.name}
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>{mockPost.author.location}</span>
              </div>
            </div>
            {reportCount > 0 && (
              <Badge variant="outline" className="text-xs bg-white/80">
                {reportCount} Report{reportCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Post Title */}
          <h4 className="font-semibold text-gray-900 mb-3 leading-tight">
            {mockPost.title}
          </h4>
        </div>

        {/* Moderation Details */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">
                Moderator
              </span>
              <p className="text-sm text-gray-900 font-medium">
                {action.moderatorName}
              </p>
            </div>
          </div>

          {action.justification && (
            <div className="bg-white/60 rounded-lg p-4 border border-white/40">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                Justification
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">
                {action.justification}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
