import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  ImageIcon,
  Video,
  Loader2,
} from "lucide-react";
import { BEST_PRACTICE_CATEGORIES } from "./constants";
import type {
  BestPracticeContentDraft,
  BestPracticeCategoryKey,
  BestPracticeMedia,
} from "@/types/bestPractices";
import { usePersistentDraft } from "./hooks/usePersistentDraft";
import { reorder } from "./utils/reorder";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur"
      aria-modal="true"
      role="dialog"
      aria-label="Create best practice"
    >
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border bg-card p-6 shadow-lg focus:outline-none"
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">New Best Practice</h2>
          <button
            onClick={() => {
              clearDraft();
              onClose();
            }}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 w-8 p-0 rounded"
            )}
            aria-label="Close wizard"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
          {["Basics", "Steps", "Benefits", "Media", "Review"].map((l, i) => (
            <button
              key={l}
              onClick={() => setWizardStep(i as StepId)}
              aria-current={wizardStep === i}
              className={cn(
                "px-2 py-1 rounded-full border text-[11px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                wizardStep === i
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40"
              )}
            >
              {i + 1}. {l}
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-6">
          {wizardStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Title</label>
                <input
                  value={draft.title}
                  onChange={(e) => update({ title: e.target.value })}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm bg-background"
                  placeholder="e.g. Optimizing Piglet Nutrition in First 14 Days"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Description</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => update({ description: e.target.value })}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm bg-background min-h-28"
                  placeholder="Short overview of the practice..."
                />
              </div>
              <div>
                <label className="text-xs font-medium">Categories</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {BEST_PRACTICE_CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() =>
                        toggleCategory(c.key as BestPracticeCategoryKey)
                      }
                      className={cn(
                        "px-2 py-1 rounded-full text-[11px] border transition",
                        draft.categories.includes(
                          c.key as BestPracticeCategoryKey
                        )
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted hover:bg-muted/70"
                      )}
                      aria-pressed={draft.categories.includes(
                        c.key as BestPracticeCategoryKey
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm">Steps</h3>
                <button
                  onClick={addStep}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-7 text-[11px] gap-1 px-2"
                  )}
                >
                  <Plus className="size-3" /> Add Step
                </button>
              </div>
              <div className="space-y-3">
                {draft.steps.map((s, i) => (
                  <div
                    key={s.id}
                    className="relative rounded border p-3 bg-background/70 group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="pt-1 flex flex-col items-center">
                        <GripVertical className="size-4 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {i + 1}
                        </span>
                      </div>
                      <textarea
                        value={s.text}
                        onChange={(e) => updateStep(s.id, e.target.value)}
                        className="flex-1 rounded border px-2 py-1 text-xs min-h-20"
                        placeholder={`Describe step ${i + 1}`}
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          disabled={i === 0}
                          aria-label="Move step up"
                          onClick={() => moveStep(s.id, -1)}
                          className="text-[10px] px-1 py-0.5 rounded border disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          disabled={i === draft.steps.length - 1}
                          aria-label="Move step down"
                          onClick={() => moveStep(s.id, 1)}
                          className="text-[10px] px-1 py-0.5 rounded border disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        onClick={() => removeStep(s.id)}
                        aria-label="Delete step"
                        className="p-1 rounded hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {wizardStep === 2 && (
            <BenefitEditor
              values={draft.benefits}
              add={addBenefit}
              remove={(v) =>
                update({ benefits: draft.benefits.filter((b) => b !== v) })
              }
            />
          )}
          {wizardStep === 3 && (
            <MediaPicker media={draft.media || null} setMedia={setMedia} />
          )}
          {wizardStep === 4 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-medium text-sm">Review</h3>
              <ul className="space-y-1 list-disc pl-4">
                <li>Title: {draft.title || "(missing)"}</li>
                <li>Description chars: {draft.description.length}</li>
                <li>Steps: {draft.steps.length}</li>
                <li>Benefits: {draft.benefits.length}</li>
                <li>Categories: {draft.categories.length}</li>
                <li>Media: {draft.media ? draft.media.kind : "None"}</li>
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={wizardStep === 0}
            onClick={() => setWizardStep((s) => (s - 1) as StepId)}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "px-4"
            )}
            aria-label="Previous step"
          >
            Back
          </button>
          {wizardStep < 4 && (
            <button
              disabled={!canNext()}
              onClick={() => setWizardStep((s) => (s + 1) as StepId)}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "px-4 disabled:opacity-40"
              )}
              aria-label="Next step"
            >
              Continue
            </button>
          )}
          {wizardStep === 4 && (
            <button
              disabled={!canNext() || saving}
              onClick={handleSave}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "px-4 inline-flex items-center gap-2"
              )}
            >
              {saving && <Loader2 className="size-4 animate-spin" />} Save
              Content
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
    <div>
      <label className="text-xs font-medium">
        Benefits{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
      </label>
      <div className="flex gap-2 mt-1">
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
          placeholder="Type benefit & Enter"
          className="flex-1 rounded border px-3 py-2 text-xs"
        />
        <button
          onClick={() => {
            add(input);
            setInput("");
          }}
          className="px-3 py-2 rounded bg-primary text-primary-foreground text-xs"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-[11px]"
          >
            {v}
            <button
              onClick={() => remove(v)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </span>
        ))}
        {values.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            No benefits added.
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
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap text-xs">
        {(["none", "image", "video"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "px-3 py-1.5 rounded border text-xs",
              mode === m
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/40 hover:bg-muted/60"
            )}
            aria-pressed={mode === m}
          >
            {m === "none" ? "No Media" : m === "image" ? "Image" : "Video"}
          </button>
        ))}
      </div>
      {mode !== "none" && (
        <div className="border rounded p-4 flex flex-col items-center gap-3">
          {!media && (
            <>
              <p className="text-xs text-muted-foreground">
                Choose a {mode} file.
              </p>
              <input
                type="file"
                accept={mode === "image" ? "image/*" : "video/*"}
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </>
          )}
          {media && (
            <div className="w-full space-y-2">
              <div className="flex items-center gap-2 text-xs">
                {media.kind === "image" ? (
                  <ImageIcon className="size-4" />
                ) : (
                  <Video className="size-4" />
                )}
                <span className="truncate flex-1">{media.file?.name}</span>
                <button
                  onClick={() => {
                    setMedia(null);
                    setMode("none");
                  }}
                  className="px-2 py-1 text-[11px] rounded bg-destructive/10 text-destructive"
                >
                  Remove
                </button>
              </div>
              {media.kind === "image" && media.previewUrl && (
                <img
                  src={media.previewUrl}
                  alt="preview"
                  className="max-h-40 rounded object-cover"
                />
              )}
              {media.kind === "video" && media.previewUrl && (
                <video
                  src={media.previewUrl}
                  className="max-h-48 w-full rounded"
                  controls
                />
              )}
              <input
                placeholder={
                  media.kind === "image"
                    ? "Alt text (required for accessibility)"
                    : "Caption"
                }
                className="w-full rounded border px-2 py-1 text-xs"
                onChange={(e) => setMedia({ ...media, alt: e.target.value })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
