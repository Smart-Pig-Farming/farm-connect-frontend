import { useEffect } from "react";
import type { BestPracticeContentDraft } from "@/types/bestPractices";

interface PracticeDetailsProps {
  practice: BestPracticeContentDraft | null;
  onClose: () => void;
}

// In-page expanding detail panel. Appears below the list when a practice is selected.
export const PracticeDetails = ({
  practice,
  onClose,
}: PracticeDetailsProps) => {
  useEffect(() => {
    if (practice) {
      // Scroll into view smoothly
      const el = document.getElementById("practice-details-panel");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [practice]);

  if (!practice) return null;

  return (
    <div
      id="practice-details-panel"
      className="mt-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white leading-tight">
          {practice.title}
        </h2>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          aria-label="Close details"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {practice.media && (
        <div className="mt-6">
          {practice.media.kind === "image" && practice.media.previewUrl && (
            <img
              src={practice.media.previewUrl}
              alt={practice.media.alt || practice.title}
              className="w-full max-h-[420px] object-cover"
              loading="lazy"
            />
          )}
          {practice.media.kind === "video" && practice.media.previewUrl && (
            <video
              controls
              className="w-full max-h-[480px] bg-black"
              src={practice.media.previewUrl}
            />
          )}
        </div>
      )}

      <div className="px-6 pb-8 pt-6">
        {/* Category tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {practice.categories.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-medium tracking-wide"
            >
              {cat.replace(/_/g, " ")}
            </span>
          ))}
        </div>

        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8 max-w-[78ch]">
          {practice.description}
        </p>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-4">
              Steps
            </h3>
            <ol className="space-y-4">
              {practice.steps
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((step, idx) => (
                  <li key={step.id} className="relative pl-10">
                    <span className="absolute left-0 top-0 flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {step.text}
                    </p>
                  </li>
                ))}
            </ol>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-4">
              Benefits
            </h3>
            <ul className="space-y-3">
              {practice.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
