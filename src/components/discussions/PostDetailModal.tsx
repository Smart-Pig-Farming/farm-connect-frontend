import { X, User, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialVideoPlayer } from "@/components/ui/social-video-player";
import { ImageGrid } from "@/components/ui/image-grid";
import { formatTimeAgo } from "@/data/moderation";

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    title: string;
    content: string;
    author: {
      name: string;
      location: string;
    };
    images: string[];
    video: string | null;
    timestamp: Date;
  };
  postId: string;
}

export function PostDetailModal({
  isOpen,
  onClose,
  post,
  postId,
}: PostDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Post Details
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {/* Author Info */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {post.author.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{post.author.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatTimeAgo(post.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {post.title}
              </h1>
            </div>

            {/* Post Content */}
            <div className="mb-8">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            </div>

            {/* Media Content */}
            {(post.images.length > 0 || post.video) && (
              <div className="space-y-4">
                {/* Video Player */}
                {post.video && (
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <SocialVideoPlayer
                      src={post.video}
                      poster="/images/thumbnail.png"
                      thumbnail="/images/thumbnail.png"
                      postId={postId}
                      className="w-full h-64 sm:h-80"
                      muted={false}
                      preload="metadata"
                      onPlay={() =>
                        console.log("Detail modal video playing:", postId)
                      }
                      onPause={() =>
                        console.log("Detail modal video paused:", postId)
                      }
                      onEnded={() =>
                        console.log("Detail modal video ended:", postId)
                      }
                    />
                  </div>
                )}

                {/* Images Grid */}
                {post.images.length > 0 && !post.video && (
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <ImageGrid
                      images={post.images}
                      className="w-full"
                      onImageClick={(index) => {
                        console.log(
                          `Viewing image ${index + 1} in detail modal`
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button variant="outline" onClick={onClose} className="px-6">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
