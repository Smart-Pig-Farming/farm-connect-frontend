import { useState } from "react";
import {
  AlertTriangle,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SocialVideoPlayer } from "@/components/ui/social-video-player";
import { ImageGrid } from "@/components/ui/image-grid";
import { PostDetailModal } from "./PostDetailModal";
import { ModerationActionModal } from "./ModerationActionModal";
import {
  type PostModerationStatus,
  formatTimeAgo,
  getReasonIcon,
  getPostData,
  truncateText,
  processModerationAction,
} from "@/data/moderation";

interface ModerationCardProps {
  moderationStatus: PostModerationStatus;
  onViewDetails: (postId: string) => void;
  onQuickAction: (
    postId: string,
    action: "retained" | "deleted" | "warned"
  ) => void;
  onActionComplete?: () => void; // Optional callback to refresh data
}

export function ModerationCard({
  moderationStatus,
  onViewDetails,
  onQuickAction,
  onActionComplete,
}: ModerationCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "retained" | "deleted" | "warned" | null
  >(null);
  const { postId, reports, reportCount, mostCommonReason } = moderationStatus;

  // Get post data from centralized mock data
  const mockPost = getPostData(postId);

  // Truncate title and content for preview
  const truncatedTitle = truncateText(mockPost.title, 80);
  const truncatedContent = truncateText(mockPost.content, 150);

  const latestReport = reports[0];
  const reasonIcon = getReasonIcon(reports[0]?.reason || "");

  const handleQuickAction = (action: "retained" | "deleted" | "warned") => {
    setPendingAction(action);
    setActionModalOpen(true);
  };

  const handleConfirmAction = async (
    action: "retained" | "deleted" | "warned",
    justification: string
  ) => {
    setIsProcessing(true);
    try {
      // Process the moderation action using the centralized function
      processModerationAction(postId, action, justification, "Current User");

      // Call the original handler to update UI state (if needed)
      await onQuickAction(postId, action);

      // Call the action complete callback to refresh data
      onActionComplete?.();

      setActionModalOpen(false);
      setPendingAction(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseActionModal = () => {
    setActionModalOpen(false);
    setPendingAction(null);
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 border-l-4 border-l-red-500 bg-white/95 backdrop-blur-sm">
      <div className="p-6">
        {/* Header with report count and most common reason */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <Badge variant="destructive" className="text-sm font-semibold">
                {reportCount} Report{reportCount !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{reasonIcon}</span>
              <span>Most Common: {mostCommonReason}</span>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="text-xs border-0 bg-blue-700 text-white"
          >
            <Clock className="h-3 w-3 mr-1" />
            {formatTimeAgo(latestReport.timestamp)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Post Preview */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Original Post</h4>
              <Button
                variant={
                  truncatedTitle.isTruncated || truncatedContent.isTruncated
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className={`text-xs ${
                  truncatedTitle.isTruncated || truncatedContent.isTruncated
                    ? "bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                    : ""
                }`}
              >
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>

            {/* Post Content Preview */}
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 space-y-3 border border-gray-200/30">
              {/* Post Header */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {mockPost.author.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {mockPost.author.location}
                  </p>
                </div>
              </div>

              {/* Post Title */}
              <h5 className="font-medium text-gray-900 leading-snug">
                {truncatedTitle.text}
              </h5>

              {/* Post Content */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {truncatedContent.text}
              </p>

              {/* Media Content */}
              {(mockPost.images.length > 0 || mockPost.video) && (
                <div className="mt-3">
                  {/* Video Player - Only if video exists (no images) */}
                  {mockPost.video && (
                    <div className="rounded-lg overflow-hidden shadow-sm">
                      <SocialVideoPlayer
                        src={mockPost.video}
                        poster="/images/thumbnail.png"
                        thumbnail="/images/thumbnail.png"
                        postId={postId}
                        className="w-full h-48 sm:h-56"
                        muted={true}
                        preload="metadata"
                        onPlay={() =>
                          console.log("Moderation video playing:", postId)
                        }
                        onPause={() =>
                          console.log("Moderation video paused:", postId)
                        }
                        onEnded={() =>
                          console.log("Moderation video ended:", postId)
                        }
                      />
                    </div>
                  )}

                  {/* Images Grid - Only if images exist (no video) */}
                  {mockPost.images.length > 0 && !mockPost.video && (
                    <ImageGrid
                      images={mockPost.images}
                      className="rounded-lg overflow-hidden shadow-sm"
                      onImageClick={(index) => {
                        console.log(
                          `Viewing image ${index + 1} for moderation`
                        );
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reports Summary */}
          <div className="flex flex-col h-full">
            <h4 className="font-medium text-gray-900 mb-4">Recent Reports</h4>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {reports.map((report, index) => (
                <div
                  key={report.id}
                  className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 shadow-sm border border-red-100/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        Report
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs border-0 bg-blue-700 text-white px-2 py-1"
                      >
                        {formatTimeAgo(report.timestamp)}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {getReasonIcon(report.reason)} {report.reason}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{report.reporterName.toLowerCase().replace(" ", "")}
                      </p>
                    </div>
                    {report.details && (
                      <p className="text-xs text-gray-600 bg-white p-3 rounded-md border border-gray-100 leading-relaxed">
                        {report.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {reportCount > reports.length && (
                <div className="text-center py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(postId)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    View {reportCount - reports.length} more report
                    {reportCount - reports.length !== 1 ? "s" : ""}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-200/50">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleQuickAction("deleted")}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
            Delete Post
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("retained")}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2 rounded-xl shadow-sm hover:shadow-md hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200"
          >
            <CheckCircle className="h-4 w-4" />
            Retain Post
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("warned")}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2 rounded-xl shadow-sm hover:shadow-md hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700 transition-all duration-200"
          >
            <AlertCircle className="h-4 w-4" />
            Warn Author
          </Button>
        </div>
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={mockPost}
        postId={postId}
      />

      {/* Moderation Action Modal */}
      <ModerationActionModal
        isOpen={actionModalOpen}
        onClose={handleCloseActionModal}
        onConfirm={handleConfirmAction}
        action={pendingAction}
        postTitle={mockPost.title}
        authorName={mockPost.author.name}
        reportCount={reportCount}
        isProcessing={isProcessing}
      />
    </Card>
  );
}
