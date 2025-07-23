import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialVideoPlayerProps {
  src: string;
  poster?: string;
  thumbnail?: string; // Add thumbnail prop
  postId?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: "none" | "metadata" | "auto";
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 1.75, 2];

export function SocialVideoPlayer({
  src,
  poster,
  thumbnail, // Add thumbnail parameter
  postId = "video",
  className,
  autoPlay = false,
  muted = true,
  loop = false,
  preload = "metadata",
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
}: SocialVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(muted ? 0 : 1);
  const [isMuted, setIsMuted] = useState(muted);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPauseIndicator, setShowPauseIndicator] = useState(false);
  const [showTapFeedback, setShowTapFeedback] = useState(false);

  // Auto-hide controls after 3 seconds of inactivity
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Handle play/pause with tap feedback
  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;

    // Show tap feedback
    setShowTapFeedback(true);
    setTimeout(() => setShowTapFeedback(false), 300);

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowOverlay(true);
        setShowPauseIndicator(true);
        // Hide pause indicator after 500ms
        setTimeout(() => setShowPauseIndicator(false), 500);
        onPause?.();
        console.log("⏸️ Video paused:", postId);
      } else {
        setIsLoading(true);
        await videoRef.current.play();
        setIsPlaying(true);
        setShowOverlay(false);
        setShowPauseIndicator(false);
        setIsLoading(false);
        onPlay?.();
        console.log("▶️ Video playing:", postId);
      }
    } catch (error) {
      console.error("❌ Error toggling video playback:", error);
      setIsLoading(false);
      setHasError(true);
    }
  }, [isPlaying, onPlay, onPause, postId]);

  // Handle volume changes
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    videoRef.current.muted = newMutedState;

    if (!newMutedState && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;

    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    videoRef.current.volume = newVolume;
    videoRef.current.muted = newVolume === 0;
  }, []);

  // Handle playback speed
  const handleSpeedChange = useCallback(
    (speed: number) => {
      if (!videoRef.current) return;

      setPlaybackRate(speed);
      videoRef.current.playbackRate = speed;
      setShowSpeedMenu(false);
      console.log(`🚀 Playback speed changed to ${speed}x for post:`, postId);
    },
    [postId]
  );

  // Handle seeking
  const handleSeek = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!videoRef.current || !progressRef.current) return;

      const rect = progressRef.current.getBoundingClientRect();
      const clickPosition = (event.clientX - rect.left) / rect.width;
      const seekTime = clickPosition * duration;

      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    },
    [duration]
  );

  // Handle skip forward/backward
  const skipForward = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(currentTime + 10, duration);
  }, [currentTime, duration]);

  const skipBackward = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(currentTime - 10, 0);
  }, [currentTime]);

  // Handle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("❌ Error toggling fullscreen:", error);
    }
  }, []);

  // Handle restart
  const handleRestart = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setCurrentTime(0);
    setProgress(0);
  }, []);

  // Format time for display
  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      console.log("📡 Video metadata loaded for post:", postId);
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
      onTimeUpdate?.(current, total);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setShowOverlay(false);
      resetControlsTimeout();
    };

    const handlePause = () => {
      setIsPlaying(false);
      setShowOverlay(true);
      setShowControls(true);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setShowOverlay(true);
      setShowControls(true);
      onEnded?.();
      console.log("🏁 Video ended:", postId);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      console.log("✅ Video ready to play:", postId);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlayThrough = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      console.error("❌ Video error for post:", postId);
    };

    // Attach event listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("error", handleError);
    };
  }, [postId, onTimeUpdate, onEnded, resetControlsTimeout]);

  // Handle mouse movement for controls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = () => {
      resetControlsTimeout();
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      if (isPlaying) {
        setShowControls(false);
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [resetControlsTimeout, isPlaying]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (event.code) {
        case "Space":
          event.preventDefault();
          togglePlayPause();
          break;
        case "KeyM":
          event.preventDefault();
          toggleMute();
          break;
        case "KeyF":
          event.preventDefault();
          toggleFullscreen();
          break;
        case "ArrowLeft":
          event.preventDefault();
          skipBackward();
          break;
        case "ArrowRight":
          event.preventDefault();
          skipForward();
          break;
        case "KeyR":
          event.preventDefault();
          handleRestart();
          break;
        case "ArrowUp":
          event.preventDefault();
          handleVolumeChange(Math.min(volume + 0.1, 1));
          break;
        case "ArrowDown":
          event.preventDefault();
          handleVolumeChange(Math.max(volume - 0.1, 0));
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    togglePlayPause,
    toggleMute,
    toggleFullscreen,
    skipBackward,
    skipForward,
    handleRestart,
    handleVolumeChange,
    volume,
  ]);

  // Error state
  if (hasError) {
    return (
      <div
        className={cn(
          "relative bg-gray-100 flex items-center justify-center",
          className
        )}
      >
        <div className="text-center text-gray-500">
          <div className="mb-2">⚠️</div>
          <p className="text-sm">Video unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail || poster} // Use thumbnail first, then fallback to poster
        className="w-full h-full object-cover cursor-pointer"
        preload={preload}
        muted={muted}
        loop={loop}
        playsInline
        autoPlay={autoPlay}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          togglePlayPause();
        }}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Center Play Button Overlay - Social Media Style */}
      {showOverlay && !isLoading && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center cursor-pointer bg-gradient-to-b from-transparent via-black/10 to-transparent"
          style={{ pointerEvents: "auto" }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePlayPause();
          }}
        >
          <div className="bg-black/40 backdrop-blur-md rounded-full p-6 border border-white/20 transform transition-all duration-300 hover:scale-110 hover:bg-black/50 shadow-2xl">
            <Play
              className="h-16 w-16 text-white ml-2"
              fill="white"
              strokeWidth={0}
            />
          </div>
        </div>
      )}

      {/* Social Media Tap Area - Instagram/TikTok Style */}
      {!showOverlay && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePlayPause();
          }}
        />
      )}

      {/* Brief Pause Indicator - Social Media Style */}
      {showPauseIndicator && !showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 backdrop-blur-md rounded-full p-4 animate-pulse">
            <Pause
              className="h-12 w-12 text-white"
              fill="white"
              strokeWidth={0}
            />
          </div>
        </div>
      )}

      {/* Tap Feedback - Social Media Style */}
      {showTapFeedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full border-2 border-white/60 animate-ping" />
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent",
          "transition-opacity duration-300",
          showControls || isHovered ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div
            ref={progressRef}
            className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-4 group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-orange-500 rounded-full relative group-hover:h-1.5 transition-all duration-200"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              {/* Skip Backward */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
                onClick={skipBackward}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              {/* Skip Forward */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
                onClick={skipForward}
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              {/* Time Display */}
              <span className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Restart */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
                onClick={handleRestart}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) =>
                    handleVolumeChange(parseFloat(e.target.value))
                  }
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Speed Control */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2 min-w-12"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                >
                  <span className="text-xs font-medium">{playbackRate}x</span>
                </Button>

                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 py-1 z-10">
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={cn(
                          "block w-full px-3 py-1.5 text-left text-sm transition-colors",
                          speed === playbackRate
                            ? "text-orange-400 bg-white/10"
                            : "text-white hover:bg-white/10"
                        )}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
                onClick={toggleFullscreen}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs p-2 rounded opacity-70">
          Space: Play/Pause • F: Fullscreen • M: Mute • ←→: Skip • ↑↓: Volume
        </div>
      )}
    </div>
  );
}

export default SocialVideoPlayer;
