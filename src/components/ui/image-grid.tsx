import { useState } from "react";
import { X } from "lucide-react";

interface ImageGridProps {
  images: string[];
  className?: string;
  onImageClick?: (index: number) => void;
}

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Image Lightbox Modal Component
function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: ImageLightboxProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-60 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
          >
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-60 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
          >
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m9 5 7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Main Image */}
      <div className="max-w-screen-lg max-h-screen p-4">
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

export function ImageGrid({
  images,
  className = "",
  onImageClick,
}: ImageGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    onImageClick?.(index);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Enhanced grid layout logic for optimal space utilization
  const getGridLayout = () => {
    switch (images.length) {
      case 1:
        return "grid-cols-1"; // Single image takes full width
      case 2:
        return "grid-cols-2"; // Two images side by side
      case 3:
        return "grid-cols-2"; // First image spans 2 rows, other 2 stack vertically
      case 4:
        return "grid-cols-2"; // 2x2 grid
      default:
        return "grid-cols-2";
    }
  };

  const getImageClassName = (index: number) => {
    const baseClasses =
      "relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100";

    if (images.length === 1) {
      // Single image: use full width and good aspect ratio
      return `${baseClasses} w-full h-full aspect-[16/10] min-h-[300px] max-h-[500px]`;
    }

    if (images.length === 2) {
      // Two images: equal height, side by side, fill container height
      return `${baseClasses} w-full h-full`;
    }

    if (images.length === 3) {
      if (index === 0) {
        // First image: spans 2 rows, fill full height
        return `${baseClasses} row-span-2 w-full h-full`;
      }
      // Other two images: fill their allocated space
      return `${baseClasses} w-full h-full`;
    }

    if (images.length === 4) {
      // Four images: perfect squares, fill container
      return `${baseClasses} w-full h-full`;
    }

    return `${baseClasses} w-full h-full aspect-square`;
  };

  const getGridRows = () => {
    if (images.length === 3) return "grid-rows-2 h-[420px]"; // Optimized height for 3 images
    if (images.length === 4) return "grid-rows-2 h-[420px]"; // Consistent height for 4 images
    return ""; // Auto for 1 and 2 images
  };

  const getContainerClassName = () => {
    const baseClasses = "grid gap-1.5"; // Slightly smaller gap for better space usage
    const layoutClasses = `${getGridLayout()} ${getGridRows()}`;

    // Add specific height constraints for better layouts
    if (images.length === 1) {
      return `${baseClasses} ${layoutClasses} w-full`;
    }
    if (images.length === 2) {
      return `${baseClasses} ${layoutClasses} h-[320px]`; // Slightly taller for better proportion
    }
    if (images.length === 3) {
      return `${baseClasses} ${layoutClasses}`;
    }
    if (images.length === 4) {
      return `${baseClasses} ${layoutClasses}`;
    }

    return `${baseClasses} ${layoutClasses}`;
  };

  return (
    <>
      <div className={`${getContainerClassName()} ${className}`}>
        {images.map((image, index) => (
          <div
            key={index}
            className={getImageClassName(index)}
            onClick={() => handleImageClick(index)}
          >
            <img
              src={image}
              alt={`Post image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

            {/* Image indicator - show on all images for better UX */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {index + 1}/{images.length}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </>
  );
}
