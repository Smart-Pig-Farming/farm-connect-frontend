import { useState, useEffect, useCallback } from "react";
import { X, ArrowLeft, Image as ImageIcon, Video, Plus, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Post } from "../../data/posts";

export interface EditPostData {
  title: string;
  content: string;
  tags: string[];
  images: File[];
  video: File | null;
  isMarketPost: boolean;
  isAvailable: boolean;
}

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postId: string, data: EditPostData) => void;
  post: Post | null;
}

export function EditPostModal({
  isOpen,
  onClose,
  onSubmit,
  post,
}: EditPostModalProps) {
  // Form states
  const [currentStep, setCurrentStep] = useState<"content" | "media">("content");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isMarketPost, setIsMarketPost] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"images" | "video">("images");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-populate form when post changes
  useEffect(() => {
    if (post && isOpen) {
      setTitle(post.title);
      setContent(post.content);
      setTags(post.tags);
      setIsMarketPost(post.isMarketPost);
      setIsAvailable(post.isAvailable);
      
      // Handle existing media
      if (post.video) {
        setMediaType("video");
        setImages([]);
        // Note: In a real app, you'd convert the URL back to a File object
        // For now, we'll simulate this
        setVideo(null); // Placeholder - would need proper file handling
      } else if (post.images && post.images.length > 0) {
        setMediaType("images");
        setVideo(null);
        // Note: Similar to video, you'd need to convert URLs back to File objects
        setImages([]); // Placeholder - would need proper file handling
      } else {
        setMediaType("images");
        setImages([]);
        setVideo(null);
      }
      
      setCurrentStep("content");
    }
  }, [post, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setContent("");
      setTags([]);
      setNewTag("");
      setIsMarketPost(false);
      setIsAvailable(true);
      setImages([]);
      setVideo(null);
      setMediaType("images");
      setCurrentStep("content");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Navigation functions
  const nextStep = () => {
    if (currentStep === "content" && canProceedToNextStep()) {
      setCurrentStep("media");
    }
  };

  const prevStep = () => {
    if (currentStep === "media") {
      setCurrentStep("content");
    }
  };

  const canProceedToNextStep = useCallback(() => {
    return title.trim().length >= 10 && content.trim().length >= 20;
  }, [title, content]);

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Media handling
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && images.length + files.length <= 4) {
      setImages([...images, ...files]);
      setVideo(null); // Clear video when images are added
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideo(file);
      setImages([]); // Clear images when video is added
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const switchToImages = () => {
    setMediaType("images");
    setVideo(null);
  };

  const switchToVideo = () => {
    setMediaType("video");
    setImages([]);
  };

  // Submit handling
  const handleSubmit = useCallback(async () => {
    if (!post || !canProceedToNextStep()) return;

    setIsSubmitting(true);
    try {
      const editData: EditPostData = {
        title: title.trim(),
        content: content.trim(),
        tags,
        images,
        video,
        isMarketPost,
        isAvailable,
      };

      await onSubmit(post.id, editData);
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [post, title, content, tags, images, video, isMarketPost, isAvailable, canProceedToNextStep, onSubmit, onClose]);

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            {currentStep === "media" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                className="p-2 hover:bg-white/50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Post</h2>
              <p className="text-sm text-gray-600">
                Step {currentStep === "content" ? "1" : "2"} of 2: {currentStep === "content" ? "Content" : "Media"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === "content" ? (
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What would you like to discuss?"
                  className="w-full"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/200 characters (minimum 10)
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, ask questions, or provide helpful information..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {content.length}/5000 characters (minimum 20)
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {tags.length < 5 && (
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      className="flex-1"
                      maxLength={20}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button onClick={addTag} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {tags.length}/5 tags
                </p>
              </div>

              {/* Market Post Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isMarketPost}
                    onChange={(e) => setIsMarketPost(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    This is a marketplace post
                  </span>
                </label>

                {isMarketPost && (
                  <label className="flex items-center gap-3 ml-6">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-600">
                      Item is available for sale
                    </span>
                  </label>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Media Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Media Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={switchToImages}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 ${
                      mediaType === "images"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <ImageIcon className="h-6 w-6 text-gray-600" />
                    <span className="text-sm font-medium">Images (1-4)</span>
                  </button>
                  <button
                    onClick={switchToVideo}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 ${
                      mediaType === "video"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Video className="h-6 w-6 text-gray-600" />
                    <span className="text-sm font-medium">Video (Max 1)</span>
                  </button>
                </div>
              </div>

              {/* Media Upload */}
              {mediaType === "images" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Images ({images.length}/4)
                  </label>
                  
                  {/* Current Images */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                const url = URL.createObjectURL(image);
                                window.open(url, '_blank');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Images */}
                  {images.length < 4 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to add images ({4 - images.length} remaining)
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Video
                  </label>
                  
                  {/* Current Video */}
                  {video && (
                    <div className="relative group mb-4">
                      <video
                        src={URL.createObjectURL(video)}
                        className="w-full h-48 object-cover rounded-lg border"
                        controls
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={removeVideo}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Add Video */}
                  {!video && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Video className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to add a video
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Media Constraint Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You can upload either images OR a video, but not both in the same post.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            
            <div className="flex gap-3">
              {currentStep === "content" ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceedToNextStep()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next: Media
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceedToNextStep()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "Updating..." : "Update Post"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
