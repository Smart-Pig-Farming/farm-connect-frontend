import { useEffect, useState } from "react";
import type { BestPracticeContentDraft } from "@/types/bestPractices";
import {
  X,
  Clock,
  CheckCircle,
  Play,
  ArrowRight,
  Sparkles,
  Blocks,
  Star,
} from "lucide-react";

interface PracticeDetailsProps {
  practice: BestPracticeContentDraft | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

// In-page expanding detail panel. Appears below the list when a practice is selected.
export const PracticeDetails = ({
  practice,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: PracticeDetailsProps) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (practice) {
      // Scroll into view smoothly
      const el = document.getElementById("practice-details-panel");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [practice]);

  const toggleStepComplete = (stepId: string) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const estimatedReadTime = practice
    ? Math.max(2, Math.ceil(practice.steps.length * 1.5))
    : 0;

  if (!practice) return null;

  return (
    <div
      id="practice-details-panel"
      className="mt-10 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40 overflow-hidden backdrop-blur-sm"
    >
      {/* Enhanced Header with Actions */}
      <div className="relative bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-start justify-between gap-6 px-8 pt-8 pb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/50">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Best Practice
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  {estimatedReadTime} min read
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-3 tracking-tight">
              {practice.title}
            </h1>

            {practice.description && (
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {practice.description}
              </p>
            )}
          </div>

          {/* Close Button */}
          <div className="shrink-0">
            <div className="flex items-center gap-3">
              {hasPrev && (
                <button
                  onClick={onPrev}
                  className="group flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-md hover:shadow-lg border hover:cursor-pointer border-slate-200/50 dark:border-slate-600/50 transition-all duration-200"
                  aria-label="Previous practice"
                >
                  <svg
                    className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              {hasNext && (
                <button
                  onClick={onNext}
                  className="group flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-md hover:shadow-lg border hover:cursor-pointer border-slate-200/50 dark:border-slate-600/50 transition-all duration-200"
                  aria-label="Next practice"
                >
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="group flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-md hover:shadow-lg border hover:cursor-pointer border-slate-200/50 dark:border-slate-600/50 transition-all duration-200"
                aria-label="Close details"
              >
                <X className="w-5 h-5 transition-transform group-hover:scale-110" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Media Section */}
      {practice.media && (
        <div className="relative group">
          {practice.media.kind === "image" && practice.media.previewUrl && (
            <div className="relative overflow-hidden">
              <img
                src={practice.media.previewUrl}
                alt={practice.media.alt || practice.title}
                className="w-full max-h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}
          {practice.media.kind === "video" && practice.media.previewUrl && (
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800">
              <video
                controls
                className="w-full max-h-[500px] bg-black"
                src={practice.media.previewUrl}
              />
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                <Play className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">
                  Video Guide
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="px-8 pb-10 pt-8">
        {/* Enhanced Category Tags */}
        <div className="flex flex-wrap gap-3 mb-8">
          {practice.categories.map((cat, index) => (
            <span
              key={cat}
              className={`group relative px-4 py-2 rounded-xl font-medium text-sm tracking-wide transition-all duration-200 cursor-default ${
                index % 3 === 0
                  ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50"
                  : index % 3 === 1
                  ? "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/50"
                  : "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/50"
              } hover:shadow-lg hover:scale-105`}
            >
              {cat.replace(/_/g, " ")}
              <div className="absolute inset-0 rounded-xl bg-white/20 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </span>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid gap-12 xl:grid-cols-3 lg:grid-cols-1">
          {/* Steps Section - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Blocks className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Implementation Steps
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Follow these steps to implement this practice
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {practice.steps
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((step, idx) => {
                  const isCompleted = completedSteps.has(step.id);
                  return (
                    <div
                      key={step.id}
                      className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer ${
                        isCompleted
                          ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-700/50 shadow-lg shadow-emerald-500/10"
                          : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-lg"
                      }`}
                      onClick={() => toggleStepComplete(step.id)}
                    >
                      <div className="flex items-start gap-4 p-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                              isCompleted
                                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30"
                                : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {idx + 1}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`leading-relaxed transition-colors duration-300 ${
                              isCompleted
                                ? "text-slate-700 dark:text-slate-300"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {step.text}
                          </p>
                        </div>

                        <div
                          className={`shrink-0 transition-all duration-300 ${
                            isCompleted
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Key Benefits
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Why this practice works
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {practice.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="group relative rounded-xl bg-gradient-to-r from-white to-slate-50 dark:from-slate-800/50 dark:to-slate-700/30 border border-slate-200/50 dark:border-slate-700/50 p-5 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {benefit}
                    </p>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>

            {/* Call to Action - Original Design */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-lg">
                Ready to continue?
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Move on to the next practice when you're ready.
              </p>
              <button
                onClick={onNext}
                disabled={!hasNext}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg ${
                  hasNext
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                }`}
              >
                <ArrowRight
                  className={`w-5 h-5 transition-transform ${
                    hasNext ? "group-hover:translate-x-1" : ""
                  }`}
                />
                Next Practice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Streamlined Navigation Section */}
      {(hasPrev || hasNext) && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {/* Previous Practice */}
              {hasPrev ? (
                <button
                  onClick={onPrev}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="text-sm font-medium">PREVIOUS</span>
                </button>
              ) : (
                <div></div>
              )}

              {/* Center Indicator */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-white dark:border-slate-900"></div>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    CURRENT PRACTICE
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    Navigate between practices
                  </div>
                </div>
              </div>

              {/* Next Practice */}
              {hasNext ? (
                <button
                  onClick={onNext}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
                >
                  <span className="text-sm font-medium">NEXT</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
