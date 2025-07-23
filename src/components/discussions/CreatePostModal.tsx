import { useState } from "react";
import {
  X,
  Plus,
  ImageIcon,
  VideoIcon,
  Link,
  Paperclip,
  Lightbulb,
  DollarSign,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePostData) => void;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
  isMarketPost: boolean;
  isAvailable: boolean;
  images?: File[];
  video?: File | null;
}

const availableTags = [
  { name: "General", color: "blue" },
  { name: "Market", color: "green" },
  { name: "Health", color: "red" },
  { name: "Feed", color: "yellow" },
  { name: "Equipment", color: "purple" },
  { name: "Breeding", color: "pink" },
  { name: "Disease", color: "orange" },
  { name: "Nutrition", color: "teal" },
];

export function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isMarketPost, setIsMarketPost] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || selectedTags.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        isMarketPost,
        isAvailable: isMarketPost ? isAvailable : false,
        images,
        video,
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setIsMarketPost(false);
    setIsAvailable(true);
    setImages([]);
    setVideo(null);
    onClose();
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else if (prev.length < 3) {
        return [...prev, tag];
      }
      return prev;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          // Add to images if less than 4 images
          setImages((prev) => {
            if (prev.length < 4) {
              return [...prev, file];
            }
            return prev;
          });
        } else if (file.type.startsWith("video/")) {
          // Replace video (only one video allowed)
          setVideo(file);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const getTagColor = (tag: string) => {
    const tagInfo = availableTags.find((t) => t.name === tag);
    switch (tagInfo?.color) {
      case "blue":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "green":
        return "bg-green-100 text-green-700 border-green-200";
      case "red":
        return "bg-red-100 text-red-700 border-red-200";
      case "yellow":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "purple":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "pink":
        return "bg-pink-100 text-pink-700 border-pink-200";
      case "orange":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "teal":
        return "bg-teal-100 text-teal-700 border-teal-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
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
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-300 scale-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Plus className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Share Your Knowledge
                </h3>
                <p className="text-sm text-gray-600">
                  Empower the farming community
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your question or topic?"
                className="border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-200"
                maxLength={150}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Make it clear and descriptive
                </p>
                <span className="text-xs text-gray-400">
                  {title.length}/150
                </span>
              </div>
            </div>

            {/* Content */}
            <div>
              <Label
                htmlFor="content"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Content *
              </Label>
              <div className="relative">
                <textarea
                  id="content"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience, ask questions, or provide helpful advice..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-200 resize-none"
                  maxLength={2000}
                />

                {/* Formatting Tools */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200"
                    title="Bold"
                  >
                    <strong className="text-xs text-gray-500">B</strong>
                  </button>
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200"
                    title="Italic"
                  >
                    <em className="text-xs text-gray-500">I</em>
                  </button>
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200"
                    title="Add Link"
                  >
                    <Link className="h-3 w-3 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">Be detailed and helpful</p>
                <span className="text-xs text-gray-400">
                  {content.length}/2000
                </span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Tags * (Select 1-3)
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  const isDisabled = !isSelected && selectedTags.length >= 3;

                  return (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => handleTagToggle(tag.name)}
                      disabled={isDisabled}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-orange-500 text-white border-orange-500 shadow-md scale-105"
                          : isDisabled
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : `${getTagColor(tag.name)} hover:scale-102`
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {selectedTags.length}/3 - Tags help others find your
                post
              </p>
            </div>

            {/* Media Attachments */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Media (Optional)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-400 transition-colors duration-200">
                <input
                  type="file"
                  id="file-upload"
                  className="sr-only"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={images.length >= 4 && !!video}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center cursor-pointer ${
                    images.length >= 4 && !!video
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                    <VideoIcon className="h-5 w-5 text-gray-400" />
                    <Paperclip className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-orange-600">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Up to 4 images + 1 video (Images: max 10MB, Videos: max
                    50MB)
                  </p>
                  {images.length >= 4 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Maximum 4 images reached
                    </p>
                  )}
                  {video && (
                    <p className="text-xs text-blue-600 mt-1">
                      Video slot filled
                    </p>
                  )}
                </label>
              </div>

              {/* Media Previews */}
              {(images.length > 0 || video) && (
                <div className="mt-3 space-y-3">
                  {/* Images Preview */}
                  {images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Images ({images.length}/4)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {images.map((file, index) => (
                          <div
                            key={index}
                            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              {file.name.length > 15
                                ? `${file.name.substring(0, 15)}...`
                                : file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Preview */}
                  {video && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Video
                      </p>
                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border max-w-sm">
                        <video
                          src={URL.createObjectURL(video)}
                          className="w-full h-full object-cover"
                          controls
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                          onClick={removeVideo}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {video.name.length > 20
                            ? `${video.name.substring(0, 20)}...`
                            : video.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Market Post Options */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <Label className="text-sm font-medium text-gray-700">
                  Market Post Options
                </Label>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMarketPost}
                  onChange={(e) => setIsMarketPost(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    This is a buying/selling post
                  </span>
                  <p className="text-xs text-gray-600">
                    Mark this if you're offering products or services
                  </p>
                </div>
              </label>

              {isMarketPost && (
                <label className="flex items-start gap-3 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Mark as "Still Available"
                    </span>
                    <p className="text-xs text-gray-600">
                      Let others know this item/service is currently available
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800 mb-2">
                    Posting Tips
                  </h4>
                  <ul className="text-xs text-orange-700 space-y-1">
                    <li>• Add relevant tags to reach the right audience</li>
                    <li>• Include clear images for better engagement</li>
                    <li>• Be specific and provide helpful details</li>
                    <li>
                      • You'll earn{" "}
                      <span className="font-semibold">+2 points</span> for
                      quality posts!
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                className="flex-1 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !title.trim() ||
                  !content.trim() ||
                  selectedTags.length === 0 ||
                  isSubmitting
                }
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Posting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Post</span>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full">
                      <Star className="h-3 w-3" />
                      <span className="text-xs">+2</span>
                    </div>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
