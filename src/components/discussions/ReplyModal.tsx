import { useState } from "react";
import { X, MessageSquare, Send, ImageIcon, Smile, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    firstname: string;
    lastname: string;
    avatar: string | null;
  };
  tags: string[];
}

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onSubmitReply: (postId: string, content: string) => void;
}

export function ReplyModal({
  isOpen,
  onClose,
  post,
  onSubmitReply,
}: ReplyModalProps) {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitReply(post.id, replyContent.trim());
      setReplyContent("");
      onClose();
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReplyContent("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-16">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Reply to Post
                </h3>
                <p className="text-sm text-gray-600">
                  Share your thoughts with the community
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Original Post Preview */}
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={`${post.author.firstname} ${post.author.lastname}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white font-medium text-sm">
                    {post.author.firstname[0]}
                    {post.author.lastname[0]}
                  </div>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">
                    {post.author.firstname} {post.author.lastname}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                  {post.title}
                </h4>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {post.content}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs px-2 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-0.5"
                      >
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              {/* Current User Info */}
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <div className="w-full h-full bg-green-500 flex items-center justify-center text-white font-medium">
                    JD
                  </div>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 text-sm">John Doe</p>
                  <p className="text-gray-500 text-xs">Replying as yourself</p>
                </div>
              </div>

              {/* Reply Input */}
              <div className="space-y-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full min-h-[120px] p-4 border border-gray-300 rounded-xl resize-none transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm"
                  required
                />

                {/* Character Count */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Be respectful and constructive</span>
                  <span>{replyContent.length}/500</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    disabled
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    disabled
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    disabled
                  >
                    <Hash className="h-4 w-4" />
                  </Button>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!replyContent.trim() || isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-sm flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Post Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
