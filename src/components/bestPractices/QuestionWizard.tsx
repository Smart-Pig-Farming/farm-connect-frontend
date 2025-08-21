import { useState, useEffect, useRef, useCallback } from "react";
import { X, Trash2, Loader2, Plus } from "lucide-react";
import { BEST_PRACTICE_CATEGORIES } from "./constants";
import type {
  BestPracticeCategoryKey,
  QuizChoice,
  QuizQuestionDraft,
} from "@/types/bestPractices";
import { usePersistentDraft } from "./hooks/usePersistentDraft";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface QuestionWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (draft: QuizQuestionDraft) => void;
  initial?: Partial<QuizQuestionDraft>;
}

const emptyQuestion = (): QuizQuestionDraft => ({
  id: crypto.randomUUID(),
  category: "feeding_nutrition",
  prompt: "",
  type: "mcq",
  choices: [
    { id: crypto.randomUUID(), text: "", correct: true },
    { id: crypto.randomUUID(), text: "", correct: false },
  ],
  explanation: "",
  difficulty: "easy",
  media: null,
  status: "draft",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const QuestionWizard = ({
  open,
  onClose,
  onSave,
  initial,
}: QuestionWizardProps) => {
  const [draftId] = useState(() => initial?.id ?? crypto.randomUUID());
  const {
    state: draft,
    setState: setDraft,
    clear: clearDraft,
  } = usePersistentDraft<QuizQuestionDraft>({
    key: `bp_question_draft_${draftId}`,
    initial: () => ({ ...emptyQuestion(), id: draftId, ...initial }),
  });
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
      const t = setTimeout(() => {
        containerRef.current
          ?.querySelector<HTMLElement>("textarea, input, button")
          ?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [open]);
  if (!open) return null;
  const update = (patch: Partial<QuizQuestionDraft>) =>
    setDraft((d) => ({ ...d, ...patch, updatedAt: Date.now() }));
  const setChoice = (id: string, patch: Partial<QuizChoice>) =>
    update({
      choices: draft.choices.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  const addChoice = () =>
    update({
      choices: [
        ...draft.choices,
        {
          id: crypto.randomUUID(),
          text: "",
          correct: draft.type === "mcq" ? false : false,
        },
      ],
    });
  const removeChoice = (id: string) =>
    update({ choices: draft.choices.filter((c) => c.id !== id) });
  const toggleCorrect = (id: string) => {
    if (draft.type === "mcq")
      update({
        choices: draft.choices.map((c) => ({ ...c, correct: c.id === id })),
      });
    else
      update({
        choices: draft.choices.map((c) =>
          c.id === id ? { ...c, correct: !c.correct } : c
        ),
      });
  };
  const canSave = () =>
    draft.prompt.trim().length >= 10 &&
    (draft.type === "truefalse" ||
      (draft.choices.length >= 2 &&
        draft.choices.some((c) => c.correct) &&
        (draft.type === "mcq"
          ? draft.choices.filter((c) => c.correct).length === 1
          : true)));
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave({ ...draft, status: "saved" });
      clearDraft();
      setSaving(false);
      onClose();
    }, 400);
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-label="Create quiz question"
    >
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border bg-card p-6 shadow-lg focus:outline-none"
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold">New Quiz Question</h2>
          <button
            onClick={() => {
              clearDraft();
              onClose();
            }}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 w-8 p-0"
            )}
            aria-label="Close question wizard"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-medium">Category</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {BEST_PRACTICE_CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() =>
                    update({ category: c.key as BestPracticeCategoryKey })
                  }
                  className={cn(
                    "px-2 py-1 rounded-full text-[11px] border transition",
                    draft.category === c.key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted hover:bg-muted/70"
                  )}
                  aria-pressed={draft.category === c.key}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium">Prompt</label>
            <textarea
              value={draft.prompt}
              onChange={(e) => update({ prompt: e.target.value })}
              className="mt-1 w-full rounded border px-3 py-2 text-sm min-h-28"
              placeholder="Enter question prompt..."
            />
          </div>
          <div className="flex flex-wrap gap-4 items-center text-xs">
            <div className="space-x-2">
              {(["mcq", "multi", "truefalse"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    update({
                      type: t,
                      choices:
                        t === "truefalse"
                          ? [
                              {
                                id: crypto.randomUUID(),
                                text: "True",
                                correct: true,
                              },
                              {
                                id: crypto.randomUUID(),
                                text: "False",
                                correct: false,
                              },
                            ]
                          : draft.choices,
                    })
                  }
                  className={cn(
                    "px-2 py-1 rounded border text-[11px]",
                    draft.type === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted hover:bg-muted/70"
                  )}
                  aria-pressed={draft.type === t}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="space-x-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => update({ difficulty: d })}
                  className={cn(
                    "px-2 py-1 rounded border text-[11px]",
                    draft.difficulty === d
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "bg-muted hover:bg-muted/70"
                  )}
                  aria-pressed={draft.difficulty === d}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          {draft.type !== "truefalse" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Choices</span>
                <button
                  onClick={addChoice}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-7 text-[11px] px-2 gap-1"
                  )}
                >
                  <Plus className="size-3" /> Add Choice
                </button>
              </div>
              <div className="space-y-2">
                {draft.choices.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <input
                      value={c.text}
                      onChange={(e) =>
                        setChoice(c.id, { text: e.target.value })
                      }
                      className="flex-1 rounded border px-2 py-1 text-xs"
                      placeholder="Choice text"
                    />
                    <button
                      onClick={() => toggleCorrect(c.id)}
                      className={cn(
                        "px-2 py-1 text-[11px] rounded border",
                        c.correct
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-muted hover:bg-muted/70"
                      )}
                      aria-pressed={c.correct}
                    >
                      {draft.type === "mcq"
                        ? c.correct
                          ? "Correct"
                          : "Mark"
                        : "Toggle"}
                    </button>
                    {draft.choices.length > 2 && (
                      <button
                        onClick={() => removeChoice(c.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-destructive"
                        aria-label="Remove choice"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-medium">
              Explanation{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <textarea
              value={draft.explanation}
              onChange={(e) => update({ explanation: e.target.value })}
              className="mt-1 w-full rounded border px-3 py-2 text-xs min-h-20"
              placeholder="Why is this correct?"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={() => {
              clearDraft();
              onClose();
            }}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "px-4"
            )}
            aria-label="Cancel and close"
          >
            Cancel
          </button>
          <button
            disabled={!canSave() || saving}
            onClick={handleSave}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "px-4 inline-flex items-center gap-2 disabled:opacity-40"
            )}
            aria-label="Save question"
          >
            {saving && <Loader2 className="size-4 animate-spin" />} Save
            Question
          </button>
        </div>
      </div>
    </div>
  );
};
