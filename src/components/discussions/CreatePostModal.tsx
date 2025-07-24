import { useState } from "react";
import {
  X,
  Plus,
  ImageIcon,
  VideoIcon,
  ArrowRight,
  ArrowLeft,
  Check,
  DollarSign,
  Star,
  Upload,
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

type Step = "content" | "media";

interface StepInfo {
  id: Step;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: StepInfo[] = [
  {
    id: "content",
    title: "Post Content",
    description: "Add your title, content, and tags",
    icon: ({ className }) => <Star className={className} />,
  },
  {
    id: "media",
    title: "Media (Optional)",
    description: "Add images or video to your post",
    icon: ({ className }) => <ImageIcon className={className} />,
  },
];

export function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  // Stepper state
  const [currentStep, setCurrentStep] = useState<Step>("content");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isMarketPost, setIsMarketPost] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  // Track selected media type for compact form
  const [mediaType, setMediaType] = useState<"images" | "video">("images");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Navigation functions
  const nextStep = () => {
    if (currentStep === "content") setCurrentStep("media");
  };

  const prevStep = () => {
    if (currentStep === "media") setCurrentStep("content");
  };

  const canProceedToNextStep = () => {
    if (currentStep === "content") {
      return title.trim() && content.trim() && selectedTags.length > 0;
    }
    return true; // Media step is optional
  };

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
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep("content");
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setIsMarketPost(false);
    setIsAvailable(true);
    setImages([]);
    setVideo(null);
    onClose();
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
        <div className="relative w-full max-w-3xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-300 scale-100">
          {/* Header with Stepper */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Plus className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Create New Post
                  </h3>
                  <p className="text-sm text-gray-600">
                    Share your knowledge with the community
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

            {/* Stepper */}
            <div className="flex items-center justify-center">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted =
                  steps.findIndex((s) => s.id === currentStep) > index;
                const IconComponent = step.icon;

                return (
                  <div key={step.id} className="flex items-center">
                    {/* Step Circle */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <IconComponent className="h-5 w-5" />
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="ml-4 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          isActive
                            ? "text-orange-600"
                            : isCompleted
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {step.description}
                      </p>
                    </div>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div
                        className={`w-12 h-0.5 mx-4 ${
                          isCompleted ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {currentStep === "content" && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Post Content
                </h4>

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
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your post about?"
                    className="w-full transition-colors duration-200 focus:border-orange-500 focus:ring-orange-500/20"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <Label
                    htmlFor="content"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Content *
                  </Label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your knowledge, experience, or question..."
                    className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none transition-colors duration-200 focus:border-orange-500 focus:ring-orange-500/20 focus:outline-none focus:ring-2"
                    required
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Tags * (Select at least one)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag.name);
                      return (
                        <button
                          key={tag.name}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTags((prev) =>
                                prev.filter((t) => t !== tag.name)
                              );
                            } else {
                              setSelectedTags((prev) => [...prev, tag.name]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                            isSelected
                              ? getTagColor(tag.name)
                              : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Market Post Options */}
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="marketPost"
                      checked={isMarketPost}
                      onChange={(e) => setIsMarketPost(e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <Label
                      htmlFor="marketPost"
                      className="text-sm font-medium text-green-800 flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      This is a buying/selling post
                    </Label>
                  </div>
                  <p className="text-xs text-green-700 ml-7">
                    Mark this if you're offering products or services for sale
                  </p>

                  {isMarketPost && (
                    <div className="ml-7 space-y-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isAvailable"
                          checked={isAvailable}
                          onChange={(e) => setIsAvailable(e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <Label
                          htmlFor="isAvailable"
                          className="text-sm text-green-800"
                        >
                          Item/Service is currently available
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === "media" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Add Media (Optional)
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    You can add images or video to enhance your post, or publish
                    without any media.
                  </p>
                </div>

                {/* Media Type Selection */}
                <div className="space-y-4">
                  <p className="text-sm text-blue-800 font-medium">
                    Choose Media Type
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaType("images");
                        setVideo(null);
                      }}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                        mediaType === "images"
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon
                          className={`h-6 w-6 ${
                            mediaType === "images"
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                        <span className="font-medium text-sm">Images</span>
                        <span className="text-xs opacity-75">
                          Up to 4 images
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaType("video");
                        setImages([]);
                      }}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                        mediaType === "video"
                          ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50/50"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <VideoIcon
                          className={`h-6 w-6 ${
                            mediaType === "video"
                              ? "text-purple-600"
                              : "text-gray-400"
                          }`}
                        />
                        <span className="font-medium text-sm">Video</span>
                        <span className="text-xs opacity-75">
                          One video only
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Image Upload Section */}
                  {mediaType === "images" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Upload Images
                        </span>
                        <span className="text-xs text-gray-500">
                          {images.length}/4 images
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[...Array(4)].map((_, i) => {
                          const hasImage = images[i];
                          return (
                            <div
                              key={i}
                              className="group relative aspect-square"
                            >
                              {hasImage ? (
                                <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-green-200 bg-green-50">
                                  <img
                                    src={URL.createObjectURL(hasImage)}
                                    alt={`Upload ${i + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(i)}
                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                              ) : (
                                <label className="relative w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/50 group-hover:scale-[1.02]">
                                  <div className="flex flex-col items-center space-y-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                      <Upload className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Add Image
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        PNG, JPG up to 10MB
                                      </p>
                                    </div>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                </label>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Video Upload Section */}
                  {mediaType === "video" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Upload Video
                        </span>
                        {video && (
                          <span className="text-xs text-green-600 font-medium">
                            Video selected
                          </span>
                        )}
                      </div>
                      <div className="group relative">
                        {video ? (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-green-200 bg-green-50">
                            <video
                              src={URL.createObjectURL(video)}
                              className="w-full h-full object-cover"
                              controls
                            />
                            <button
                              type="button"
                              onClick={removeVideo}
                              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                          </div>
                        ) : (
                          <label className="relative w-full aspect-video flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all hover:border-purple-400 hover:bg-purple-50/50 group-hover:scale-[1.01]">
                            <div className="flex flex-col items-center space-y-4">
                              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                <VideoIcon className="h-8 w-8 text-gray-400 group-hover:text-purple-500 transition-colors" />
                              </div>
                              <div className="text-center space-y-1">
                                <p className="text-base font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                                  Upload Video
                                </p>
                                <p className="text-sm text-gray-500">
                                  MP4, MOV, AVI up to 100MB
                                </p>
                                <p className="text-xs text-gray-400">
                                  Click or drag to upload
                                </p>
                              </div>
                            </div>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleFileUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-8">
              <div>
                {currentStep !== "content" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                {currentStep === "content" ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
                  >
                    Next: Add Media
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {isSubmitting ? "Publishing..." : "Publish Post"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
