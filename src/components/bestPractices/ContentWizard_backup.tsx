import { useState, useEffect, useRef, useCallback } from "react";
import { X, Plus, Trash2, ImageIcon, Video as VideoIcon, Loader2, Upload, Check } from "lucide-react";
import { BEST_PRACTICE_CATEGORIES } from "./constants";
import type {
  BestPracticeContentDraft,
  BestPracticeCategoryKey,
  BestPracticeMedia,
} from "@/types/bestPractices";
import { usePersistentDraft } from "./hooks/usePersistentDraft";
import { reorder } from "./utils/reorder";

interface ContentWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (draft: BestPracticeContentDraft) => void;
  initial?: Partial<BestPracticeContentDraft>;
}
const emptyDraft = (): BestPracticeContentDraft => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  steps: [{ id: crypto.randomUUID(), text: "", order: 0 }],
  benefits: [],
  categories: [],
  media: null,
  status: "draft",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
type StepId = 0 | 1 | 2 | 3 | 4;

export const ContentWizard = ({
  open,
  onClose,
  onSave,
  initial,
}: ContentWizardProps) => {
  const [draftId] = useState(() => initial?.id ?? crypto.randomUUID());
  const {
    state: draft,
    setState: setDraft,
    clear: clearDraft,
  } = usePersistentDraft<BestPracticeContentDraft>({
    key: `bp_content_draft_${draftId}`,
    initial: () => ({ ...emptyDraft(), id: draftId, ...initial }),
  });
  const [wizardStep, setWizardStep] = useState<StepId>(0);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"));
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      setWizardStep(0);
      const t = setTimeout(() => {
        containerRef.current
          ?.querySelector<HTMLElement>("input,textarea,button")
          ?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  const update = (patch: Partial<BestPracticeContentDraft>) =>
    setDraft((d) => ({ ...d, ...patch, updatedAt: Date.now() }));
  const updateStep = (id: string, text: string) =>
    update({
      steps: draft.steps.map((s) => (s.id === id ? { ...s, text } : s)),
    });
  const addStep = () =>
    update({
      steps: [
        ...draft.steps,
        { id: crypto.randomUUID(), text: "", order: draft.steps.length },
      ],
    });
  const removeStep = (id: string) =>
    update({
      steps: draft.steps
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i })),
    });
  const moveStep = (id: string, dir: -1 | 1) => {
    const idx = draft.steps.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const to = Math.min(draft.steps.length - 1, Math.max(0, idx + dir));
    update({
      steps: reorder(draft.steps, idx, to).map((s, i) => ({ ...s, order: i })),
    });
  };
  const addBenefit = (value: string) => {
    const v = value.trim();
    if (!v) return;
    if (draft.benefits.includes(v)) return;
    update({ benefits: [...draft.benefits, v] });
  };
  const toggleCategory = (key: BestPracticeCategoryKey) =>
    update({
      categories: draft.categories.includes(key)
        ? draft.categories.filter((c) => c !== key)
        : [...draft.categories, key],
    });
  const setMedia = (media: BestPracticeMedia | null) => update({ media });
  const canNext = () => {
    switch (wizardStep) {
      case 0:
        return (
          draft.title.trim().length >= 5 &&
          draft.description.trim().length >= 20
        );
      case 1:
        return draft.steps.every((s) => s.text.trim().length >= 5);
      default:
        return true;
    }
  };
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave({ ...draft, status: "saved" });
      clearDraft();
      setSaving(false);
      onClose();
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/20 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label="Create best practice"
    >
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className="w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl shadow-black/10 focus:outline-none"
      >
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Create Best Practice</h2>
              <p className="text-orange-100 text-sm mt-1 hidden sm:block">
                Share your knowledge with the farming community
              </p>
            </div>
            <button
              onClick={() => {
                clearDraft();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close wizard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 sm:mt-6">
            <div className="flex items-center gap-1">
              {["Basics", "Steps", "Benefits", "Media", "Review"].map(
                (label, index) => (
                  <div key={label} className="flex items-center flex-1">
                    <button
                      onClick={() => setWizardStep(index as StepId)}
                      className={`group relative flex-1 py-2 sm:py-3 px-1 sm:px-2 rounded-lg sm:rounded-xl text-xs font-medium transition-all duration-300 ${
                        wizardStep === index
                          ? "bg-white/20 text-white shadow-lg"
                          : wizardStep > index
                          ? "bg-white/10 text-white hover:bg-white/15"
                          : "text-orange-200 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            wizardStep === index
                              ? "bg-white text-orange-600 scale-110"
                              : wizardStep > index
                              ? "bg-orange-300 text-orange-800"
                              : "bg-orange-400/30 text-orange-200"
                          }`}
                        >
                          {wizardStep > index ? "✓" : index + 1}
                        </div>
                        <span className="text-xs sm:text-sm hidden sm:inline">
                          {label}
                        </span>
                      </div>
                    </button>
                    {index < 4 && (
                      <div
                        className={`w-1 sm:w-2 h-0.5 mx-0.5 sm:mx-1 transition-colors duration-300 ${
                          wizardStep > index ? "bg-white/40" : "bg-orange-400/30"
                        }`}
                      />
                    )}
                  </div>
                )
              )}
            </div>

            {/* Mobile Step Label */}
            <div className="mt-3 text-center sm:hidden">
              <span className="text-xs text-orange-100">
                {wizardStep === 0 && "Step 1: Basics"}
                {wizardStep === 1 && "Step 2: Steps"}
                {wizardStep === 2 && "Step 3: Benefits"}
                {wizardStep === 3 && "Step 4: Media"}
                {wizardStep === 4 && "Step 5: Review"}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)] bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-800 dark:to-slate-900">
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Step 0: Basics */}
            {wizardStep === 0 && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Practice Title *
                  </label>
                  <input
                    value={draft.title}
                    onChange={(e) => update({ title: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200"
                    placeholder="e.g. Optimizing Piglet Nutrition in First 14 Days"
                  />
                  {draft.title.length < 5 && draft.title.length > 0 && (
                    <p className="text-xs text-orange-600 mt-2">Title must be at least 5 characters</p>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Description *
                  </label>
                  <textarea
                    value={draft.description}
                    onChange={(e) => update({ description: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 min-h-32 resize-none"
                    placeholder="Provide a clear overview of this best practice and its benefits..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    {draft.description.length < 20 && draft.description.length > 0 && (
                      <p className="text-xs text-orange-600">Description must be at least 20 characters</p>
                    )}
                    <p className="text-xs text-slate-500 ml-auto">{draft.description.length} characters</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    Categories
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {BEST_PRACTICE_CATEGORIES.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() =>
                          toggleCategory(c.key as BestPracticeCategoryKey)
                        }
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                          draft.categories.includes(c.key as BestPracticeCategoryKey)
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                            : "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 hover:scale-102"
                        }`}
                        aria-pressed={draft.categories.includes(c.key as BestPracticeCategoryKey)}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Select categories that best describe your practice
                  </p>
                </div>
              </div>
            )}

        {/* Content Section */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-800 dark:to-slate-900">
          <div className="p-8 space-y-8">
            {/* Step 0: Basics */}
            {wizardStep === 0 && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Practice Title *
                  </label>
                  <input
                    value={draft.title}
                    onChange={(e) => update({ title: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200"
                    placeholder="e.g. Optimizing Piglet Nutrition in First 14 Days"
                  />
                  {draft.title.length < 5 && draft.title.length > 0 && (
                    <p className="text-xs text-orange-600 mt-2">
                      Title must be at least 5 characters
                    </p>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Description *
                  </label>
                  <textarea
                    value={draft.description}
                    onChange={(e) => update({ description: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 min-h-32 resize-none"
                    placeholder="Provide a clear overview of this best practice and its benefits..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    {draft.description.length < 20 &&
                      draft.description.length > 0 && (
                        <p className="text-xs text-orange-600">
                          Description must be at least 20 characters
                        </p>
                      )}
                    <p className="text-xs text-slate-500 ml-auto">
                      {draft.description.length} characters
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    Categories
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {BEST_PRACTICE_CATEGORIES.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() =>
                          toggleCategory(c.key as BestPracticeCategoryKey)
                        }
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                          draft.categories.includes(
                            c.key as BestPracticeCategoryKey
                          )
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                            : "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 hover:scale-102"
                        }`}
                        aria-pressed={draft.categories.includes(
                          c.key as BestPracticeCategoryKey
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Select categories that best describe your practice
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Steps */}
            {wizardStep === 1 && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        Practice Steps
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Break down your practice into clear, actionable steps
                      </p>
                    </div>
                    <button
                      onClick={addStep}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
                    >
                      <Plus className="w-4 h-4" /> Add Step
                    </button>
                  </div>

                  <div className="space-y-4">
                    {draft.steps.map((s, i) => (
                      <div
                        key={s.id}
                        className="group relative bg-slate-50 dark:bg-slate-700 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-2 pt-1">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {i + 1}
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                disabled={i === 0}
                                aria-label="Move step up"
                                onClick={() => moveStep(s.id, -1)}
                                className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors duration-200"
                              >
                                ↑
                              </button>
                              <button
                                disabled={i === draft.steps.length - 1}
                                aria-label="Move step down"
                                onClick={() => moveStep(s.id, 1)}
                                className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors duration-200"
                              >
                                ↓
                              </button>
                            </div>
                          </div>

                          <div className="flex-1">
                            <textarea
                              value={s.text}
                              onChange={(e) => updateStep(s.id, e.target.value)}
                              className="w-full rounded-xl bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 min-h-24 resize-none"
                              placeholder={`Describe step ${
                                i + 1
                              } in detail...`}
                            />
                            {s.text.length < 5 && s.text.length > 0 && (
                              <p className="text-xs text-orange-600 mt-2">
                                Step must be at least 5 characters
                              </p>
                            )}
                          </div>

                          {draft.steps.length > 1 && (
                            <button
                              onClick={() => removeStep(s.id)}
                              className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100"
                              aria-label="Remove step"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Benefits */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <BenefitEditor
                    values={draft.benefits}
                    add={addBenefit}
                    remove={(v) =>
                      update({
                        benefits: draft.benefits.filter((b) => b !== v),
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 3: Media */}
            {wizardStep === 3 && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <MediaPicker
                    media={draft.media || null}
                    setMedia={setMedia}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {wizardStep === 4 && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">
                    Review Your Best Practice
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Title
                      </h4>
                      <p className="text-slate-900 dark:text-slate-100">
                        {draft.title}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Description
                      </h4>
                      <p className="text-slate-900 dark:text-slate-100">
                        {draft.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Steps ({draft.steps.length})
                      </h4>
                      <ol className="space-y-2">
                        {draft.steps.map((step, i) => (
                          <li key={step.id} className="flex gap-3">
                            <span className="font-medium text-orange-600">
                              {i + 1}.
                            </span>
                            <span className="text-slate-900 dark:text-slate-100">
                              {step.text}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {draft.benefits.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Benefits
                        </h4>
                        <ul className="space-y-1">
                          {draft.benefits.map((benefit, i) => (
                            <li key={i} className="flex gap-2 items-center">
                              <span className="text-green-500">✓</span>
                              <span className="text-slate-900 dark:text-slate-100">
                                {benefit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Categories
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {draft.categories.map((catKey) => {
                          const category = BEST_PRACTICE_CATEGORIES.find(
                            (c) => c.key === catKey
                          );
                          return (
                            <span
                              key={catKey}
                              className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm"
                            >
                              {category?.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {draft.media && (
                      <div>
                        <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Media
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          {draft.media.kind === "image" ? "Image" : "Video"}{" "}
                          attached: {draft.media.file?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Navigation */}
        <div className="bg-white dark:bg-slate-900 p-6 flex justify-between items-center shadow-lg">
          <button
            disabled={wizardStep === 0}
            onClick={() => setWizardStep((s) => (s - 1) as StepId)}
            className="px-6 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Previous step"
          >
            ← Back
          </button>

          <div className="text-sm text-slate-500">
            Step {wizardStep + 1} of 5
          </div>

          {wizardStep < 4 && (
            <button
              disabled={!canNext()}
              onClick={() => setWizardStep((s) => (s + 1) as StepId)}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              aria-label="Next step"
            >
              Continue →
            </button>
          )}

          {wizardStep === 4 && (
            <button
              disabled={!canNext() || saving}
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Practice"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const BenefitEditor = ({
  values,
  add,
  remove,
}: {
  values: string[];
  add: (v: string) => void;
  remove: (v: string) => void;
}) => {
  const [input, setInput] = useState("");
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Benefits (Optional)
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          What are the key benefits of following this practice?
        </p>
      </div>

      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(input);
              setInput("");
            }
          }}
          placeholder="Type a benefit and press Enter..."
          className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200"
        />
        <button
          onClick={() => {
            add(input);
            setInput("");
          }}
          className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {values.map((v) => (
          <div
            key={v}
            className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-xl p-3 group hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <span className="text-slate-900 dark:text-slate-100">{v}</span>
            </div>
            <button
              onClick={() => remove(v)}
              className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
        {values.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-700 rounded-xl">
            No benefits added yet. Add some to help others understand the value
            of this practice.
          </p>
        )}
      </div>
    </div>
  );
};

const MediaPicker = ({
  media,
  setMedia,
}: {
  media: BestPracticeMedia | null;
  setMedia: (m: BestPracticeMedia | null) => void;
}) => {
  const [mode, setMode] = useState<"none" | "image" | "video">(
    media ? media.kind : "none"
  );

  useEffect(() => {
    if (mode === "none") setMedia(null);
  }, [mode, setMedia]);

  const onFile = (file?: File) => {
    if (!file) return;
    const kind = mode === "image" ? "image" : "video";
    const previewUrl = URL.createObjectURL(file);
    setMedia({ kind, file, previewUrl });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Add Media (Optional)
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Enhance your practice with images or videos to help others understand better
        </p>
      </div>

      {/* Media Type Selection - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(["none", "image", "video"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`p-4 rounded-xl text-center transition-all duration-200 ${
              mode === m
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:scale-102"
            }`}
            aria-pressed={mode === m}
          >
            <div className="flex flex-col items-center gap-2">
              {m === "none" && (
                <X className="w-6 h-6" />
              )}
              {m === "image" && (
                <ImageIcon className="w-6 h-6" />
              )}
              {m === "video" && (
                <VideoIcon className="w-6 h-6" />
              )}
              <span className="font-medium text-sm">
                {m === "none" ? "No Media" : m === "image" ? "Image" : "Video"}
              </span>
              <span className="text-xs opacity-75">
                {m === "none" 
                  ? "Skip media" 
                  : m === "image" 
                  ? "JPG, PNG, GIF" 
                  : "MP4, MOV, AVI"
                }
              </span>
            </div>
          </button>
        ))}
      </div>

      {mode !== "none" && (
        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 sm:p-6">
          {!media && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Upload {mode === "image" ? "Image" : "Video"} (JPG, PNG, GIF, WebP for images / MP4, MOV, AVI, WebM for videos)
              </label>
              <input
                type="file"
                accept={mode === "image" ? "image/jpeg,image/jpg,image/png,image/gif,image/webp" : "video/mp4,video/mov,video/avi,video/webm"}
                onChange={(e) => onFile(e.target.files?.[0])}
                className="hidden"
                id={`${mode}-upload`}
              />
              <label
                htmlFor={`${mode}-upload`}
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 sm:p-8 cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors group"
              >
                <Upload className="w-8 h-8 text-slate-400 mb-3 group-hover:text-orange-500 transition-colors" />
                <span className="text-sm text-slate-600 dark:text-slate-400 mb-1 text-center">
                  Click to upload {mode} or drag and drop
                </span>
                <span className="text-xs text-slate-500 text-center">
                  Max 100MB per file
                </span>
              </label>
            </div>
          )}

          {media && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  {media.kind === "image" ? (
                    <ImageIcon className="w-5 h-5 text-orange-500" />
                  ) : (
                    <VideoIcon className="w-5 h-5 text-orange-500" />
                  )}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {media.file?.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMedia(null);
                    setMode("none");
                  }}
                  className="px-3 py-1 text-xs rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
                >
                  Remove
                </button>
              </div>

              {/* Preview */}
              <div className="rounded-xl overflow-hidden">
                {media.kind === "image" && media.previewUrl && (
                  <img
                    src={media.previewUrl}
                    alt="preview"
                    className="w-full max-h-64 object-cover"
                  />
                )}

                {media.kind === "video" && media.previewUrl && (
                  <video
                    src={media.previewUrl}
                    className="w-full max-h-64 object-cover"
                    controls
                    poster=""
                  />
                )}
              </div>

              {/* Alt Text / Caption */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {media.kind === "image" 
                    ? "Alt text (required for accessibility)" 
                    : "Caption (optional)"
                  }
                </label>
                <input
                  type="text"
                  value={media.alt || ""}
                  placeholder={
                    media.kind === "image"
                      ? "Describe what's in the image..."
                      : "Add a caption for your video..."
                  }
                  className="w-full rounded-xl bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                  onChange={(e) => setMedia({ ...media, alt: e.target.value })}
                />
                {media.kind === "image" && (
                  <p className="text-xs text-slate-500 mt-1">
                    Alt text helps screen readers understand your image content
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
