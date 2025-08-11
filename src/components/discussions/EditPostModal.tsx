import { useState, useEffect, useRef } from "react";
import {
  X,
  Edit,
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

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditPostData) => void;
  post?: PostToEdit;
}

export interface PostToEdit {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isMarketPost: boolean;
  isAvailable: boolean;
  images?: string[];
  video?: string;
}

export interface EditPostData {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isMarketPost: boolean;
  isAvailable: boolean;
  images?: File[];
  video?: File | null;
  existingImages?: string[];
  existingVideo?: string;
  removedImages?: string[];
  removedVideo?: boolean;
}

const availableTags = [
  { name: "General", color: "blue" },
  { name: "Market", color: "green" },
  { name: "Health", color: "red" },
  { name: "Feed", color: "yellow" },
  { name: "Equipment", color: "purple" },
  { name: "Breeding", color: "pink" },
  { name: "Events", color: "orange" },
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
    description: "Edit your title, content, and tags",
    icon: ({ className }) => <Star className={className} />,
  },
  {
    id: "media",
    title: "Media (Optional)",
    description: "Update images or video for your post",
    icon: ({ className }) => <ImageIcon className={className} />,
  },
];

export function EditPostModal({
  isOpen,
  onClose,
  onSubmit,
  post,
}: EditPostModalProps) {
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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideo, setExistingVideo] = useState<string>("");
  // Track explicit removals for server-side deletion
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [removedVideo, setRemovedVideo] = useState<boolean>(false);
  // Track selected media type for compact form
  const [mediaType, setMediaType] = useState<"images" | "video">("images");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    tags?: string;
  }>({});

  // Refs for focusing invalid inputs
  const titleRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const tagsContainerRef = useRef<HTMLDivElement | null>(null);

  // Pre-populate form when post changes
  useEffect(() => {
    if (post && isOpen) {
      setTitle(post.title);
      setContent(post.content);
      setSelectedTags(post.tags);
      setIsMarketPost(post.isMarketPost);
      setIsAvailable(post.isAvailable);
      setExistingImages(post.images || []);
      setExistingVideo(post.video || "");
      setImages([]);
      setVideo(null);
      setMediaType(post.images && post.images.length > 0 ? "images" : "video");
      setCurrentStep("content");
      setErrors({});
      setRemovedImages([]);
      setRemovedVideo(false);
    }
  }, [post, isOpen]);

  // Navigation functions
  const validateContentStep = () => {
    const nextErrors: { title?: string; content?: string; tags?: string } = {};
    if (!title.trim()) nextErrors.title = "Title is required";
    if (!content.trim()) nextErrors.content = "Content is required";
    if (selectedTags.length === 0) nextErrors.tags = "Select at least one tag";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.title && titleRef.current) {
        titleRef.current.focus();
      } else if (nextErrors.content && contentRef.current) {
        contentRef.current.focus();
      } else if (nextErrors.tags && tagsContainerRef.current) {
        tagsContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return false;
    }
    return true;
  };

  const nextStep = () => {
    console.log("Moving to next step, current:", currentStep);
    if (currentStep === "content") {
      if (validateContentStep()) {
        setCurrentStep("media");
      }
      return;
    }
  };

  const prevStep = () => {
    console.log("Moving to previous step, current:", currentStep);
    if (currentStep === "media") {
      setCurrentStep("content");
    }
  };

  // Removed render-time validation; validation runs on click via validateContentStep

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Form submitted, current step:", currentStep);

    // Only allow submission from media step
    if (currentStep !== "media") {
      console.log("Preventing submission - not on media step");
      return;
    }

    if (
      !title.trim() ||
      !content.trim() ||
      selectedTags.length === 0 ||
      !post?.id
    ) {
      console.log("Validation failed", {
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags.length,
        postId: post?.id,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: post.id,
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        isMarketPost,
        isAvailable: isMarketPost ? isAvailable : false,
        images,
        video,
        existingImages,
        existingVideo,
        removedImages,
        removedVideo,
      });
      handleClose();
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    console.log("Closing modal");
    setCurrentStep("content");
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setIsMarketPost(false);
    setIsAvailable(true);
    setImages([]);
    setVideo(null);
    setExistingImages([]);
    setExistingVideo("");
    setRemovedImages([]);
    setRemovedVideo(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          // Add to images if less than 4 images (including existing)
          setImages((prev) => {
            const totalImages = prev.length + existingImages.length;
            if (totalImages < 4) {
              return [...prev, file];
            }
            return prev;
          });
        } else if (file.type.startsWith("video/")) {
          // Replace video (only one video allowed)
          setVideo(file);
          setExistingVideo("");
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => {
      const url = prev[index];
      if (url) {
        setRemovedImages((ri) => (ri.includes(url) ? ri : [...ri, url]));
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const restoreRemovedImage = (url: string) => {
    setRemovedImages((prev) => prev.filter((u) => u !== url));
    setExistingImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const removeExistingVideo = () => {
    // Keep the preview but mark for deletion; user can Undo before submitting
    setRemovedVideo(true);
  };

  // getTagColor removed; unified orange selection style used

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
          <div className="relative p-6 bg-gradient-to-b from-orange-50 to-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Edit className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Edit Post
                  </h3>
                  <p className="text-sm text-gray-600">
                    Update your post content and settings
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

            {/* Subtle gradient separator instead of border */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
          </div>

          {/* Step Content */}
          <div className="p-6">
            {currentStep === "content" && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Edit Post Content
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
                    ref={titleRef}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title)
                        setErrors((prev) => ({ ...prev, title: undefined }));
                    }}
                    placeholder="What's your post about?"
                    className={`w-full transition-colors duration-200 focus:border-orange-500 focus:ring-orange-500/20 ${
                      errors.title
                        ? "border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : ""
                    }`}
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                  )}
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
                    ref={contentRef}
                    onChange={(e) => {
                      setContent(e.target.value);
                      if (errors.content)
                        setErrors((prev) => ({ ...prev, content: undefined }));
                    }}
                    placeholder="Share your knowledge, experience, or question..."
                    className={`w-full min-h-[120px] p-3 border rounded-lg resize-none transition-colors duration-200 focus:border-orange-500 focus:ring-orange-500/20 focus:outline-none focus:ring-2 ${
                      errors.content
                        ? "border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.content && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.content}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Tags * (Select at least one)
                  </Label>
                  <div
                    ref={tagsContainerRef}
                    className={`flex flex-wrap gap-2 ${
                      errors.tags ? "p-2 rounded border border-red-300" : ""
                    }`}
                  >
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
                            if (errors.tags)
                              setErrors((prev) => ({
                                ...prev,
                                tags: undefined,
                              }));
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                            isSelected
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                  {errors.tags && (
                    <p className="mt-1 text-xs text-red-600">{errors.tags}</p>
                  )}
                </div>

                {/* Market Post Options */}
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="marketPost"
                      checked={isMarketPost}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsMarketPost(checked);
                        // Align UI state with backend behavior: when not a market post, availability is false
                        if (!checked) setIsAvailable(false);
                      }}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
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
                    Mark this if you're offering products or services for sale.
                    Your choice will be saved when you update the post.
                  </p>

                  {isMarketPost && (
                    <div className="ml-7 space-y-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isAvailable"
                          checked={isAvailable}
                          onChange={(e) => setIsAvailable(e.target.checked)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <Label
                          htmlFor="isAvailable"
                          className="text-sm text-green-800"
                        >
                          Item/Service is currently available
                        </Label>
                      </div>
                      <p className="text-xs text-green-700">
                        This availability will be saved when you update the
                        post.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === "media" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Update Media (Optional)
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    You can update images or video for your post, or keep
                    existing media.
                  </p>
                </div>

                {/* Media Type Selection */}
                <div className="space-y-4">
                  <p className="text-sm text-orange-800 font-medium">
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
                          ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50/50"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon
                          className={`h-6 w-6 ${
                            mediaType === "images"
                              ? "text-orange-600"
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
                          ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50/50"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <VideoIcon
                          className={`h-6 w-6 ${
                            mediaType === "video"
                              ? "text-orange-600"
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
                          Manage Images
                        </span>
                        <span className="text-xs text-gray-500">
                          {existingImages.length + images.length}/4 images
                        </span>
                      </div>

                      {/* Existing Images */}
                      {existingImages.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600 font-medium">
                            Current Images:
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {existingImages.map((imageSrc, i) => (
                              <div
                                key={`existing-${i}`}
                                className="group relative aspect-square"
                              >
                                <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-orange-200 bg-orange-50">
                                  <img
                                    src={imageSrc}
                                    alt={`Existing ${i + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeExistingImage(i)}
                                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 border border-gray-300 rounded-full w-7 h-7 flex items-center justify-center shadow-sm transition-colors"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Removed Images (marked for deletion) */}
                      {removedImages.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-red-600">
                            Marked for removal:
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {removedImages.map((imageSrc) => (
                              <div
                                key={`removed-${imageSrc}`}
                                className="group relative aspect-square"
                              >
                                <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-red-300 bg-red-50">
                                  <img
                                    src={imageSrc}
                                    alt="Removed"
                                    className="w-full h-full object-cover opacity-70"
                                  />
                                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                                    Removed
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      restoreRemovedImage(imageSrc)
                                    }
                                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 border border-gray-300 rounded-full px-2 h-7 flex items-center justify-center shadow-sm transition-colors text-xs"
                                  >
                                    Undo
                                  </button>
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Images */}
                      {images.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-green-600 font-medium">
                            New Images:
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {images.map((image, i) => (
                              <div
                                key={`new-${i}`}
                                className="group relative aspect-square"
                              >
                                <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-green-200 bg-green-50">
                                  <img
                                    src={URL.createObjectURL(image)}
                                    alt={`New ${i + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(i)}
                                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 border border-gray-300 rounded-full w-7 h-7 flex items-center justify-center shadow-sm transition-colors"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add New Images */}
                      {existingImages.length + images.length < 4 && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600 font-medium">
                            Add More Images:
                          </p>
                          <label className="relative w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all hover:border-orange-400 hover:bg-orange-50/50">
                            <div className="flex flex-col items-center space-y-2">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-orange-100 transition-colors">
                                <Upload className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
                                  Add Images
                                </p>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG up to 10MB
                                </p>
                              </div>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleFileUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Upload Section */}
                  {mediaType === "video" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Manage Video
                        </span>
                        {(video || existingVideo) && (
                          <span className="text-xs text-green-600 font-medium">
                            Video selected
                          </span>
                        )}
                      </div>

                      {/* Existing Video */}
                      {existingVideo && !video && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600 font-medium">
                            Current Video:
                          </p>
                          <div className="group relative">
                            <div
                              className={`relative w-full aspect-video rounded-lg overflow-hidden border-2 ${
                                removedVideo
                                  ? "border-red-300 bg-red-50"
                                  : "border-orange-200 bg-orange-50"
                              }`}
                            >
                              <video
                                src={existingVideo}
                                className="w-full h-full object-cover"
                                controls
                              />
                              <button
                                type="button"
                                onClick={removeExistingVideo}
                                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              {removedVideo && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                                      Removed
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setRemovedVideo(false)}
                                      className="text-xs px-2 py-1 rounded-full bg-white/90 border border-gray-300 hover:bg-white shadow-sm"
                                    >
                                      Undo
                                    </button>
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* New Video */}
                      {video && (
                        <div className="space-y-2">
                          <p className="text-xs text-green-600 font-medium">
                            New Video:
                          </p>
                          <div className="group relative">
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-green-200 bg-green-50">
                              <video
                                src={URL.createObjectURL(video)}
                                className="w-full h-full object-cover"
                                controls
                              />
                              <button
                                type="button"
                                onClick={removeVideo}
                                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Upload New Video */}
                      {!video && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600 font-medium">
                            {existingVideo ? "Replace Video:" : "Add Video:"}
                          </p>
                          <label className="relative w-full aspect-video flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all hover:border-orange-400 hover:bg-orange-50/50">
                            <div className="flex flex-col items-center space-y-4">
                              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center hover:bg-orange-100 transition-colors">
                                <VideoIcon className="h-8 w-8 text-gray-400 hover:text-orange-500 transition-colors" />
                              </div>
                              <div className="text-center space-y-1">
                                <p className="text-base font-medium text-gray-700 hover:text-orange-600 transition-colors">
                                  {existingVideo
                                    ? "Replace Video"
                                    : "Upload Video"}
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
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 mt-6">
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
                  <div className="flex flex-col items-end gap-2">
                    {Object.keys(errors).length > 0 && (
                      <p className="text-xs text-red-600">
                        Please fix the highlighted fields.
                      </p>
                    )}
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        nextStep();
                      }}
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
                    >
                      Next: Update Media
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contents">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {isSubmitting ? "Updating..." : "Update Post"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
