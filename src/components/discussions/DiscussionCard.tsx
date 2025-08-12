import { useState, useEffect, useRef } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  AlertTriangle,
  MapPin,
  Clock,
  Star,
  Shield,
  Crown,
  Award,
  ShoppingBag,
  MoreVertical,
  Trash2,
  Check,
  X,
  Edit,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ReportModal } from "@/components/discussions/ReportModal";
import { ContactModal } from "@/components/discussions/ContactModal";
import { RepliesSection } from "@/components/discussions/RepliesSection";
import { SocialVideoPlayer } from "@/components/ui/social-video-player";
import { ImageGrid } from "@/components/ui/image-grid";
import type { Post } from "../../data/posts";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useApprovePostMutation,
  useRejectPostMutation,
} from "@/store/api/discussionsApi";
import { toast } from "sonner";

interface DiscussionCardProps {
  post: Post;
  onVote?: (postId: string, voteType: "up" | "down") => void;
  onView?: (postId: string) => void;
  onVoteReply?: (replyId: string, voteType: "up" | "down") => void;
  onLoadMoreReplies?: (postId: string) => void;
  onEditPost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  currentUserId?: string;
}

export function DiscussionCard({
  post,
  onVote,
  onView,
  onVoteReply,
  onLoadMoreReplies,
  onEditPost,
  onDeletePost,
  currentUserId,
}: DiscussionCardProps) {
  const isUpSelected = post.userVote === "up";
  const isDownSelected = post.userVote === "down";
  const { hasPermission } = usePermissions();
  const canModerate = hasPermission("MODERATE:POSTS");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localApproved, setLocalApproved] = useState<boolean | null>(null);
  // Transient vote feedback
  const [flashUp, setFlashUp] = useState(false);
  const [flashDown, setFlashDown] = useState(false);
  const [upDelta, setUpDelta] = useState<number | null>(null);
  const [downDelta, setDownDelta] = useState<number | null>(null);

  const [approvePost, { isLoading: isApproving }] = useApprovePostMutation();
  const [rejectPost, { isLoading: isRejecting }] = useRejectPostMutation();

  const isApproved = (localApproved ?? post.isModeratorApproved) === true;

  // Content truncation logic - social media style
  const MAX_CONTENT_LENGTH = 200; // Characters to show before "Read more"
  const shouldShowReadMore = post.content.length > MAX_CONTENT_LENGTH;
  const displayContent = isContentExpanded
    ? post.content
    : post.content.slice(0, MAX_CONTENT_LENGTH) +
      (shouldShowReadMore ? "..." : "");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleVote = (voteType: "up" | "down") => {
    // Determine if this action adds or removes a vote based on current state
    if (voteType === "up") {
      const delta = post.userVote === "up" ? -1 : 1;
      setUpDelta(delta);
      setFlashUp(true);
      setTimeout(() => {
        setFlashUp(false);
        setUpDelta(null);
      }, 500);
    } else {
      const delta = post.userVote === "down" ? -1 : 1;
      setDownDelta(delta);
      setFlashDown(true);
      setTimeout(() => {
        setFlashDown(false);
        setDownDelta(null);
      }, 500);
    }
    onVote?.(post.id, voteType);
  };

  const handleReport = (reason: string, details?: string) => {
    console.log(
      "Reporting post:",
      post.id,
      "Reason:",
      reason,
      "Details:",
      details
    );
    setShowReportModal(false);
  };

  const handleContactSeller = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowContactModal(true);
  };

  const handleDeletePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);

    // Check if this is user's own post and callback is available
    if (currentUserId && post.author.id === currentUserId && onDeletePost) {
      onDeletePost(post.id);
    } else {
      // Moderators can also delete
      if (canModerate && onDeletePost) {
        onDeletePost(post.id);
      } else {
        console.log("Delete not permitted for this user", post.id);
      }
    }
  };

  const handleEditPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);

    if (onEditPost) {
      onEditPost(post.id);
    }
  };

  const handleApprovePost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    if (isApproving) return;
    const prev = localApproved;
    setLocalApproved(true);
    try {
      await approvePost({ id: post.id }).unwrap();
      toast.success("Post approved");
    } catch {
      setLocalApproved((prev ?? post.isModeratorApproved ?? false) as boolean);
      toast.error("Failed to approve post");
    }
  };

  const handleUndoApproval = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    if (isRejecting) return;
    const prev = localApproved;
    setLocalApproved(false);
    try {
      await rejectPost({ id: post.id }).unwrap();
      toast.success("Approval removed");
    } catch {
      setLocalApproved((prev ?? post.isModeratorApproved ?? false) as boolean);
      toast.error("Failed to remove approval");
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const getLevelIcon = (levelId: number) => {
    switch (levelId) {
      case 1:
        return (
          <Star className="h-3.5 w-3.5 text-amber-500" fill="currentColor" />
        );
      case 2:
        return (
          <Shield className="h-3.5 w-3.5 text-blue-500" fill="currentColor" />
        );
      case 3:
        return (
          <Crown className="h-3.5 w-3.5 text-yellow-500" fill="currentColor" />
        );
      default:
        return (
          <Star className="h-3.5 w-3.5 text-amber-500" fill="currentColor" />
        );
    }
  };

  const getLevelName = (levelId: number) => {
    switch (levelId) {
      case 1:
        return "Amateur";
      case 2:
        return "Knight";
      case 3:
        return "Expert";
      default:
        return "Amateur";
    }
  };

  const getLevelBadgeStyle = (levelId: number) => {
    switch (levelId) {
      case 1:
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-700";
      case 2:
        return "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700";
      case 3:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-700";
      default:
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-700";
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "market":
        return "bg-green-100 text-green-700 border-green-200";
      case "health":
        return "bg-red-100 text-red-700 border-red-200";
      case "feed":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "general":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <>
      <Card
        className={`overflow-hidden border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 cursor-pointer ${
          isHovered ? "shadow-xl scale-[1.02]" : "shadow-lg"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onView?.(post.id)}
      >
        {/* Header with tags and actions */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`text-xs font-medium border ${getTagColor(
                  tag
                )} transition-colors duration-200`}
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.createdAt}
            </span>

            {/* Dropdown Menu (visible only to users with Moderate:Posts permission) */}
            {canModerate && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    {/* Show different options based on whether it's user's own post */}
                    {currentUserId && post.author.id === currentUserId ? (
                      // User's own post - show edit and delete options
                      <>
                        <button
                          onClick={handleEditPost}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                          Edit Post
                        </button>
                        <button
                          onClick={handleDeletePost}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Post
                        </button>
                      </>
                    ) : (
                      // Other users' posts - show moderation options or default options
                      <>
                        {!isApproved ? (
                          <button
                            onClick={handleApprovePost}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                            Approve Post
                          </button>
                        ) : (
                          <button
                            onClick={handleUndoApproval}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200"
                          >
                            <X className="h-4 w-4 text-orange-600" />
                            Undo Approval
                          </button>
                        )}
                        <button
                          onClick={handleDeletePost}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Post
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-3 sm:p-4">
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              fallback={`${post.author.firstname} ${post.author.lastname}`}
              className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white shadow-md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                  <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {post.author.firstname} {post.author.lastname}
                  </span>

                  {/* Level Badge */}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-sm transition-all duration-200 hover:shadow-md ${getLevelBadgeStyle(
                      post.author.level_id
                    )}`}
                  >
                    {getLevelIcon(post.author.level_id)}
                    <span className="text-xs font-semibold">
                      {getLevelName(post.author.level_id)}
                    </span>
                    <span className="text-xs opacity-75 font-medium">
                      {post.author.points}
                    </span>
                  </div>
                </div>

                {/* Moderator Approval Badge - Mobile Responsive */}
                {isApproved && (
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 flex-shrink-0">
                    <Award
                      className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white"
                      fill="currentColor"
                    />
                    <span className="text-[10px] sm:text-xs font-bold text-white tracking-wide whitespace-nowrap">
                      APPROVED
                    </span>
                  </div>
                )}
              </div>

              {post.author.location?.trim() && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{post.author.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-orange-600 transition-colors duration-200">
              {post.title}
            </h3>

            {/* Content with Read More functionality */}
            <div className="text-gray-700 text-sm sm:text-base">
              <p
                className={`transition-all duration-300 ease-in-out ${
                  isContentExpanded ? "mb-2" : "mb-3"
                }`}
              >
                {displayContent}
                {shouldShowReadMore && !isContentExpanded && (
                  <span
                    className="text-orange-600 hover:text-orange-700 font-medium cursor-pointer ml-1 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsContentExpanded(true);
                    }}
                  >
                    Read more
                  </span>
                )}
              </p>

              {/* Show less option when expanded */}
              {isContentExpanded && shouldShowReadMore && (
                <button
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium cursor-pointer transition-colors duration-200 mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsContentExpanded(false);
                  }}
                >
                  Show less
                </button>
              )}
            </div>

            {/* Media Content */}
            {(post.images.length > 0 || post.video) && (
              <div className="mt-3 space-y-3">
                {/* Images Grid */}
                {post.images.length > 0 && !post.video && (
                  <ImageGrid
                    images={post.images}
                    className="rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                    onImageClick={(index) => {
                      console.log(
                        `Opening image ${index + 1} for post:`,
                        post.id
                      );
                    }}
                  />
                )}

                {/* Video Player */}
                {post.video && (
                  <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <SocialVideoPlayer
                      src={post.video}
                      poster={
                        post.videoThumbnail || post.coverThumb || undefined
                      }
                      thumbnail={post.coverThumb || undefined}
                      postId={post.id}
                      className="w-full h-48 sm:h-56 lg:h-64"
                      muted={true}
                      preload="metadata"
                      onPlay={() => console.log("✅ Video playing:", post.id)}
                      onPause={() => console.log("⏸️ Video paused:", post.id)}
                      onEnded={() => console.log("🏁 Video ended:", post.id)}
                    />
                  </div>
                )}

                {/* Images with Video (thumbnail view) */}
                {post.images.length > 0 && post.video && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <SocialVideoPlayer
                        src={post.video}
                        poster={
                          post.videoThumbnail ||
                          post.images[0] ||
                          post.coverThumb ||
                          undefined
                        }
                        thumbnail={post.coverThumb || undefined}
                        postId={post.id}
                        className="w-full h-32 sm:h-40"
                        muted={true}
                        preload="metadata"
                        onPlay={() => console.log("✅ Video playing:", post.id)}
                        onPause={() => console.log("⏸️ Video paused:", post.id)}
                        onEnded={() => console.log("🏁 Video ended:", post.id)}
                      />
                    </div>
                    <ImageGrid
                      images={post.images.slice(0, 3)}
                      className="rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                      onImageClick={(index) => {
                        console.log(
                          `Opening image ${index + 1} for post:`,
                          post.id
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Market Post Indicator - Clean & Simple */}
            {post.isMarketPost && (
              <div
                className="mt-3 p-3 rounded-lg bg-emerald-50 border-l-4 border-emerald-500 flex items-center justify-between group hover:bg-emerald-100 transition-colors duration-200 cursor-pointer"
                onClick={handleContactSeller}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="text-emerald-800 font-semibold text-sm">
                      Market Listing
                    </span>
                    <p className="text-emerald-600 text-xs">Click to contact</p>
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    post.isAvailable
                      ? "bg-green-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {post.isAvailable ? "Available" : "Sold"}
                </div>
              </div>
            )}
          </div>

          {/* Engagement Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Upvote */}
              <Button
                variant="ghost"
                size="sm"
                className={`relative flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] max-[475px]:px-1.5 max-[475px]:py-1 max-[475px]:text-xs ${
                  post.userVote === "up"
                    ? "bg-green-50 text-green-600"
                    : "text-gray-600 hover:text-green-600"
                } ${flashUp ? "ring-2 ring-green-300 ring-offset-1" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote("up");
                }}
              >
                {typeof upDelta === "number" && (
                  <span
                    className={`absolute -top-2 right-1 text-[10px] font-semibold ${
                      upDelta > 0 ? "text-green-600" : "text-gray-500"
                    } animate-bounce`}
                  >
                    {upDelta > 0 ? "+1" : "-1"}
                  </span>
                )}
                <div
                  className={`p-1 rounded border border-transparent transition-all duration-300 ease-in-out ${
                    isUpSelected
                      ? "border-green-400 bg-green-100"
                      : "hover:border-green-400"
                  } ${flashUp ? "animate-pulse" : ""}`}
                >
                  <ThumbsUp
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 max-[475px]:h-2.5 max-[475px]:w-2.5 transition-transform duration-200 ${
                      isUpSelected
                        ? "scale-110 text-green-600"
                        : "text-gray-600"
                    }`}
                    strokeWidth={isUpSelected ? 2.5 : 2}
                  />
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium max-[475px]:text-[10px] transition-transform duration-200 ${
                    flashUp ? "scale-125" : ""
                  } ${isUpSelected ? "text-green-700" : "text-gray-700"}`}
                >
                  {post.upvotes}
                </span>
              </Button>

              {/* Downvote */}
              <Button
                variant="ghost"
                size="sm"
                className={`relative flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] max-[475px]:px-1.5 max-[475px]:py-1 max-[475px]:text-xs ${
                  post.userVote === "down"
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:text-red-600"
                } ${flashDown ? "ring-2 ring-red-300 ring-offset-1" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote("down");
                }}
              >
                {typeof downDelta === "number" && (
                  <span
                    className={`absolute -top-2 right-1 text-[10px] font-semibold ${
                      downDelta > 0 ? "text-red-600" : "text-gray-500"
                    } animate-bounce`}
                  >
                    {downDelta > 0 ? "+1" : "-1"}
                  </span>
                )}
                <div
                  className={`p-1 rounded border border-transparent transition-all duration-300 ease-in-out ${
                    isDownSelected
                      ? "border-red-400 bg-red-100"
                      : "hover:border-red-400"
                  } ${flashDown ? "animate-pulse" : ""}`}
                >
                  <ThumbsDown
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 max-[475px]:h-2.5 max-[475px]:w-2.5 transition-transform duration-200 ${
                      isDownSelected
                        ? "scale-110 text-red-600"
                        : "text-gray-600"
                    }`}
                    strokeWidth={isDownSelected ? 2.5 : 2}
                  />
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium max-[475px]:text-[10px] transition-transform duration-200 ${
                    flashDown ? "scale-125" : ""
                  } ${isDownSelected ? "text-red-700" : "text-gray-700"}`}
                >
                  {post.downvotes}
                </span>
              </Button>

              {/* Replies */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] max-[475px]:px-1.5 max-[475px]:py-1 max-[475px]:text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReplies(!showReplies);
                }}
              >
                <div className="p-1 rounded border border-transparent hover:border-blue-400 transition-all duration-300 ease-in-out">
                  <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 max-[475px]:h-2.5 max-[475px]:w-2.5" />
                </div>
                <span className="text-xs sm:text-sm font-medium max-[475px]:text-[10px]">
                  {post.replies}
                </span>
              </Button>
            </div>

            {/* Report Post - Mobile Optimized */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] max-[475px]:px-1.5 max-[475px]:py-1 max-[475px]:text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowReportModal(true);
              }}
            >
              <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5 max-[475px]:h-2.5 max-[475px]:w-2.5" />
              <span className="text-xs sm:text-sm font-medium max-[475px]:text-[10px]">
                Report
              </span>
            </Button>
          </div>
        </CardContent>

        {/* Replies Section - LinkedIn Style */}
        {showReplies && (
          <div className="px-4 pb-4">
            <RepliesSection
              postId={post.id}
              replies={post.repliesData || []}
              totalReplies={post.replies}
              onVoteReply={onVoteReply}
              onLoadMore={() => onLoadMoreReplies?.(post.id)}
            />
          </div>
        )}
      </Card>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
        postTitle={post.title}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        author={post.author}
        postTitle={post.title}
      />
    </>
  );
}
