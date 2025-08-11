import { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  ImageIcon,
  VideoIcon,
  ArrowRight,
  ArrowLeft,
  Check,
  DollarSign,
  Star,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreatePostMutation,
  useGetTagsQuery,
} from "@/store/api/discussionsApi";
import type { UploadMediaResponse } from "@/store/api/discussionsApi";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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
  onSuccess,
}: CreatePostModalProps) {
  // API hooks - only call when modal is open to prevent unnecessary requests
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const {
    data: tagsData,
    isLoading: isLoadingTags,
    error: tagsError,
  } = useGetTagsQuery(undefined, {
    skip: !isOpen, // Only fetch tags when modal is open
  });

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
  const [mediaType, setMediaType] = useState<"images" | "video">("images");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Available tags from API with fallback - memoized to prevent re-renders
  const availableTags = useMemo(() => {
    const fallbackTags = [
      { id: "1", name: "General", color: "blue" },
      { id: "2", name: "Market", color: "green" },
      { id: "3", name: "Health", color: "red" },
      { id: "4", name: "Feed", color: "yellow" },
      { id: "5", name: "Equipment", color: "purple" },
      { id: "6", name: "Breeding", color: "pink" },
    ];
    return tagsData?.data?.tags || (tagsError ? fallbackTags : []);
  }, [tagsData?.data?.tags, tagsError]);

  // Reset form when modal opens/closes - memoized to prevent infinite loops
  const resetForm = useCallback(() => {
    setCurrentStep("content");
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setIsMarketPost(false);
    setIsAvailable(true);
    setImages([]);
    setVideo(null);
    setMediaType("images");
    setErrors({});
    setIsUploadingMedia(false);
    setUploadProgress(0);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Memoized computed values to prevent unnecessary re-calculations
  const currentStepIndex = useMemo(() => {
    return steps.findIndex((step) => step.id === currentStep);
  }, [currentStep]);

  const isFirstStep = useMemo(() => currentStepIndex === 0, [currentStepIndex]);
  const isLastStep = useMemo(
    () => currentStepIndex === steps.length - 1,
    [currentStepIndex]
  );

  // Note: validation is triggered on click; Next stays enabled for better UX

  // Validation functions - memoized to prevent re-creation
  const validateStep = useCallback(
    (step: Step): boolean => {
      const newErrors: Record<string, string> = {};

      if (step === "content") {
        if (!title.trim()) {
          newErrors.title = "Title is required";
        } else if (title.trim().length < 10) {
          newErrors.title = "Title must be at least 10 characters";
        } else if (title.trim().length > 255) {
          newErrors.title = "Title must be less than 255 characters";
        }

        if (!content.trim()) {
          newErrors.content = "Content is required";
        } else if (content.trim().length < 20) {
          newErrors.content = "Content must be at least 20 characters";
        } else if (content.trim().length > 10000) {
          newErrors.content = "Content must be less than 10,000 characters";
        }

        if (selectedTags.length > 3) {
          newErrors.tags = "Maximum 3 tags allowed";
        }
      }

      if (step === "media") {
        // Business rule validation
        if (images.length > 4) {
          newErrors.media = "Maximum 4 images allowed";
        }

        if (video && images.length > 0) {
          newErrors.media =
            "Cannot include both images and video in the same post";
        }

        if (images.length > 1 && video) {
          newErrors.media =
            "Cannot include both images and video in the same post";
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [title, content, selectedTags, images, video]
  );

  const canProceedToNextStep = useCallback((): boolean => {
    return validateStep("content");
  }, [validateStep]);

  // Navigation functions - memoized to prevent re-creation
  const nextStep = useCallback(() => {
    if (currentStep === "content" && canProceedToNextStep()) {
      setCurrentStep("media");
      toast.success("Content validated! Add media or finish your post.", {
        duration: 2000,
      });
    }
  }, [currentStep, canProceedToNextStep]);

  const prevStep = useCallback(() => {
    if (currentStep === "media") {
      setCurrentStep("content");
    }
  }, [currentStep]);

  // Media handling functions - memoized to prevent re-creation
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      // Validate file types
      const validImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const invalidFiles = files.filter(
        (file) => !validImageTypes.includes(file.type)
      );

      if (invalidFiles.length > 0) {
        toast.error(`Invalid file type. Allowed: JPG, PNG, GIF, WebP`, {
          description: `Found: ${invalidFiles.map((f) => f.name).join(", ")}`,
        });
        return;
      }

      // Check file size (max 100MB per file)
      const oversizedFiles = files.filter(
        (file) => file.size > 100 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        toast.error("File size too large", {
          description: `Maximum 100MB per file. Found: ${oversizedFiles
            .map((f) => f.name)
            .join(", ")}`,
        });
        return;
      }

      const newImages = [...images, ...files];

      if (newImages.length > 4) {
        toast.error("Too many images", {
          description: "Maximum 4 images allowed per post",
        });
        return;
      }

      setImages(newImages);
      setVideo(null); // Clear video if images are added
      toast.success(`${files.length} image(s) added successfully`);
    },
    [images]
  );

  const handleVideoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validVideoTypes = [
        "video/mp4",
        "video/mov",
        "video/avi",
        "video/webm",
      ];
      if (!validVideoTypes.includes(file.type)) {
        toast.error("Invalid video format", {
          description: "Allowed formats: MP4, MOV, AVI, WebM",
        });
        return;
      }

      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video file too large", {
          description: "Maximum 100MB per video",
        });
        return;
      }

      setVideo(file);
      setImages([]); // Clear images if video is added
      toast.success("Video added successfully");
    },
    []
  );

  const removeImage = useCallback((index: number) => {
    setImages((currentImages) => currentImages.filter((_, i) => i !== index));
    toast.info("Image removed");
  }, []);

  const removeVideo = useCallback(() => {
    setVideo(null);
    toast.info("Video removed");
  }, []);

  // Form submission (2-step: create JSON, then upload media)
  const handleSubmit = async () => {
    // Validate all steps
    if (!validateStep("content") || !validateStep("media")) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    // Check if tags API failed - warn user but allow submission
    if (tagsError) {
      toast.warning("API connection issues detected", {
        description:
          "Post creation may fail. Please ensure the backend server is running.",
      });
    }

    // Build JSON payload first to avoid multipart tags issue
    const body = {
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      is_market_post: isMarketPost,
      is_available: isMarketPost ? isAvailable : true,
    };

    const loadingToastId = toast.loading("Creating your post...", {
      description:
        images.length || video
          ? "Uploading content and media"
          : "Submitting content",
    });

    try {
      // 1) Create post (JSON)
      const created = await createPost(body).unwrap();
      const postId = created.data.id;

      // 2) If media present, upload via separate endpoint
      if (images.length > 0 || video) {
        const files: File[] = images.length > 0 ? images : video ? [video] : [];
        setIsUploadingMedia(true);
        setUploadProgress(0);
        await uploadPostMediaWithProgress(postId, files, (pct) => {
          setUploadProgress(pct);
        });
        setUploadProgress(100);
        setIsUploadingMedia(false);
      }

      toast.dismiss(loadingToastId);
      toast.success("Post created successfully!", {
        description: created.data.message,
      });

      // Close modal and reset
      onClose();
      onSuccess?.();
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // Enhanced error handling
      const isNetworkError = !navigator.onLine;
      const errorData = error as {
        status?: number;
        data?: { message?: string };
      };

      const errorMessage = "Failed to create post";
      let errorDescription = "An unexpected error occurred";

      if (isNetworkError) {
        errorDescription = "No internet connection. Please check your network.";
      } else if (errorData.status === 500) {
        errorDescription = "Server error. Please try again later.";
      } else if (errorData.status === 404) {
        errorDescription =
          "API endpoint not found. Please ensure the backend server is running.";
      } else if (errorData.status === 0 || !errorData.status) {
        errorDescription =
          "Cannot connect to server. Please ensure the backend is running on the correct port.";
      } else {
        errorDescription = errorData.data?.message || "Please try again.";
      }

      toast.error(errorMessage, {
        description: errorDescription,
        action: {
          label: "Retry",
          onClick: () => handleSubmit(),
        },
      });
    }
  };

  // XHR helper for upload with progress
  const uploadPostMediaWithProgress = (
    postId: string,
    files: File[],
    onProgress?: (percent: number) => void
  ) => {
    return new Promise<UploadMediaResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/discussions/posts/${postId}/media`);
      xhr.withCredentials = true; // include cookies

      // CSRF header from cookie
      try {
        const csrf = document.cookie
          .split("; ")
          .find((c) => c.startsWith("csrfToken="))
          ?.split("=")[1];
        if (csrf) xhr.setRequestHeader("x-csrf-token", csrf);
      } catch {
        // noop
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const pct = Math.round((event.loaded / event.total) * 100);
          onProgress(pct);
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          try {
            const status = xhr.status;
            const json = JSON.parse(xhr.responseText || "{}");
            if (status >= 200 && status < 300) {
              resolve(json as UploadMediaResponse);
            } else {
              reject({ status, data: json });
            }
          } catch (e) {
            reject(e);
          }
        }
      };

      xhr.onerror = () => {
        reject({ status: 0, data: { message: "Network error" } });
      };

      const fd = new FormData();
      files.forEach((f) => fd.append("media", f));
      xhr.send(fd);
    });
  };

  const handleTagToggle = useCallback((tagName: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((t) => t !== tagName);
      } else if (prev.length < 3) {
        return [...prev, tagName];
      } else {
        toast.warning("Maximum 3 tags allowed");
        return prev;
      }
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-b from-orange-50 to-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Post
              </h2>
              <p className="text-gray-600 mt-1">
                Share your knowledge with the community
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Subtle gradient separator instead of a border */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />

          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = index < currentStepIndex;

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-sm font-medium ${
                          isActive ? "text-orange-600" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {step.description}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === "content" && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700"
                >
                  Post Title *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your post..."
                  className={`mt-1 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.title ? "border-red-500" : ""
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.title}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/255 characters
                </p>
              </div>

              {/* Content */}
              <div>
                <Label
                  htmlFor="content"
                  className="text-sm font-medium text-gray-700"
                >
                  Post Content *
                </Label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your knowledge, ask questions, or start a discussion..."
                  rows={6}
                  className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.content ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.content && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.content}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {content.length}/10,000 characters
                </p>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-baseline justify-between">
                  <Label className="text-sm font-medium text-gray-700">
                    Tags (Max 3)
                  </Label>
                  <span className="text-xs text-gray-500">
                    Selected: {selectedTags.length}/3
                  </span>
                </div>
                <div className="mt-2">
                  {isLoadingTags ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                      <span className="text-sm text-gray-500">
                        Loading tags...
                      </span>
                    </div>
                  ) : tagsError ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">
                          Using default tags (API unavailable)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleTagToggle(tag.name)}
                            className={`px-3 py-1 text-sm rounded-full border transition-all ${
                              selectedTags.includes(tag.name)
                                ? "bg-orange-100 text-orange-800 border-orange-300 ring-2 ring-orange-200"
                                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-orange-50 hover:ring-2 hover:ring-orange-200"
                            }`}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagToggle(tag.name)}
                          className={`px-3 py-1 text-sm rounded-full border transition-all ${
                            selectedTags.includes(tag.name)
                              ? "bg-orange-100 text-orange-800 border-orange-300 ring-2 ring-orange-200"
                              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-orange-50 hover:ring-2 hover:ring-orange-200"
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.tags}
                  </p>
                )}
              </div>

              {/* Market Post Settings */}
              <div className="pt-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50/60 border border-orange-100">
                  <input
                    type="checkbox"
                    id="marketPost"
                    checked={isMarketPost}
                    onChange={(e) => setIsMarketPost(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <Label
                    htmlFor="marketPost"
                    className="flex items-center text-sm font-medium text-gray-700"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    This is a marketplace post
                  </Label>
                </div>
                {isMarketPost && (
                  <div className="mt-3 ml-6">
                    <div className="flex items-center space-x-3 p-2 px-3 rounded bg-orange-50/40 border border-orange-100">
                      <input
                        type="checkbox"
                        id="available"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <Label
                        htmlFor="available"
                        className="text-sm text-gray-600"
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
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Add Media to Your Post
                </h3>
                <p className="text-gray-600 text-sm">
                  Choose either images (up to 4) or one video. You cannot mix
                  both.
                </p>
              </div>

              {/* Media Type Selection */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setMediaType("images")}
                  className={`flex-1 p-4 border rounded-lg text-center transition-colors ${
                    mediaType === "images"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-300 hover:bg-orange-50/40"
                  }`}
                >
                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Images</p>
                  <p className="text-sm text-gray-500">Up to 4 images</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType("video")}
                  className={`flex-1 p-4 border rounded-lg text-center transition-colors ${
                    mediaType === "video"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-300 hover:bg-orange-50/40"
                  }`}
                >
                  <VideoIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Video</p>
                  <p className="text-sm text-gray-500">One video file</p>
                </button>
              </div>

              {/* Media Upload */}
              {mediaType === "images" && (
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images (JPG, PNG, GIF, WebP)
                  </Label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload images or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Max 100MB per file, 4 files total
                    </span>
                  </Label>

                  {/* Image Preview */}
                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-white/90 hover:bg-white text-gray-700 border border-gray-300 rounded-full w-7 h-7 flex items-center justify-center shadow-sm"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mediaType === "video" && (
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Video (MP4, MOV, AVI, WebM)
                  </Label>
                  <input
                    type="file"
                    accept="video/mp4,video/mov,video/avi,video/webm"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <Label
                    htmlFor="video-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
                  >
                    <VideoIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload video or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Max 100MB per file
                    </span>
                  </Label>

                  {/* Video Preview */}
                  {video && (
                    <div className="mt-4 relative">
                      <video
                        src={URL.createObjectURL(video)}
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isUploadingMedia && (
                <div className="w-full mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      Uploading media…
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-orange-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {errors.media && (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.media}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-t from-gray-50 to-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Cancel
            </Button>

            {!isLastStep ? (
              <Button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isCreating || isUploadingMedia}
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              >
                {isCreating || isUploadingMedia ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>
                      {isUploadingMedia ? "Uploading media..." : "Creating..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Create Post</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
