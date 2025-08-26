import { useState, useEffect, useRef } from "react";
import { X, Trash2, Plus, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { BEST_PRACTICE_CATEGORIES } from "./constants";
import type {
  BestPracticeCategoryKey,
  QuizChoice,
  QuizQuestionDraft,
} from "@/types/bestPractices";
import { usePersistentDraft } from "./hooks/usePersistentDraft";
// NOTE: Keep original simplistic styling until separate refactor

interface QuestionWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (draft: QuizQuestionDraft) => void;
  initial?: Partial<QuizQuestionDraft>;
}

// Create a lookup map for categories
const CATEGORY_MAP = BEST_PRACTICE_CATEGORIES.reduce((acc, category) => {
  acc[category.key] = category;
  return acc;
}, {} as Record<BestPracticeCategoryKey, (typeof BEST_PRACTICE_CATEGORIES)[0]>);

// Color gradients for categories (matching CategoryGrid)
const COLOR_GRADIENTS: Record<
  string,
  { icon: string; hover: string; text: string }
> = {
  amber: {
    icon: "bg-gradient-to-br from-amber-500 to-amber-600",
    hover: "hover:from-amber-600 hover:to-amber-700",
    text: "text-amber-100",
  },
  red: {
    icon: "bg-gradient-to-br from-red-500 to-red-600",
    hover: "hover:from-red-600 hover:to-rose-600",
    text: "text-red-100",
  },
  teal: {
    icon: "bg-gradient-to-br from-teal-500 to-teal-600",
    hover: "hover:from-teal-600 hover:to-cyan-600",
    text: "text-teal-100",
  },
  green: {
    icon: "bg-gradient-to-br from-green-500 to-emerald-600",
    hover: "hover:from-green-600 hover:to-emerald-700",
    text: "text-green-100",
  },
  indigo: {
    icon: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    hover: "hover:from-indigo-600 hover:to-violet-600",
    text: "text-indigo-100",
  },
  pink: {
    icon: "bg-gradient-to-br from-pink-500 to-rose-500",
    hover: "hover:from-pink-600 hover:to-rose-600",
    text: "text-pink-100",
  },
  blue: {
    icon: "bg-gradient-to-br from-blue-500 to-blue-600",
    hover: "hover:from-blue-600 hover:to-indigo-600",
    text: "text-blue-100",
  },
  purple: {
    icon: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
    hover: "hover:from-purple-600 hover:to-fuchsia-600",
    text: "text-purple-100",
  },
  default: {
    icon: "bg-gradient-to-br from-orange-500 to-orange-600",
    hover: "hover:from-orange-600 hover:to-red-500",
    text: "text-orange-100",
  },
};

function getCategoryGradient(color?: string) {
  return COLOR_GRADIENTS[color || ""] || COLOR_GRADIENTS.default;
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
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [selectedCategories, setSelectedCategories] = useState<
    BestPracticeCategoryKey[]
  >([draft.category]);
  const totalSteps = 4;

  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // Initialize selectedCategories based on draft category
  useEffect(() => {
    if (draft.category && !selectedCategories.includes(draft.category)) {
      setSelectedCategories([draft.category]);
    }
  }, [draft.category, selectedCategories]);

  if (!open) return null;

  const update = (patch: Partial<QuizQuestionDraft>) =>
    setDraft((d) => ({ ...d, ...patch, updatedAt: Date.now() }));

  // Category selection helpers
  const toggleCategory = (categoryKey: BestPracticeCategoryKey) => {
    const newSelected = selectedCategories.includes(categoryKey)
      ? selectedCategories.filter((c) => c !== categoryKey)
      : [...selectedCategories, categoryKey];

    setSelectedCategories(newSelected);
    // Update the primary category (for backwards compatibility)
    if (newSelected.length > 0) {
      update({ category: newSelected[0] });
    }
  };

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
    selectedCategories.length > 0 &&
    draft.prompt.trim().length >= 10 &&
    (draft.type === "truefalse" ||
      (draft.choices.length >= 2 &&
        draft.choices.some((c) => c.correct) &&
        (draft.type === "mcq"
          ? draft.choices.filter((c) => c.correct).length === 1
          : true)));

  // Step navigation functions
  const goToNextStep = () => {
    const errors = validateCurrentStep();
    if (Object.keys(errors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      setValidationErrors({});
    } else {
      setValidationErrors(errors);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setValidationErrors({});
  };

  // Step validation
  const validateCurrentStep = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      // Category and prompt validation
      if (selectedCategories.length === 0) {
        errors.category = "Please select at least one category";
      }
      if (!draft.prompt?.trim()) {
        errors.prompt = "Please enter a question prompt";
      }
    } else if (currentStep === 2) {
      // Answer choices validation
      if (draft.type !== "truefalse") {
        if (draft.choices.length < 2) {
          errors.choices = "Please add at least 2 answer choices";
        } else if (!draft.choices.some((c) => c.correct)) {
          errors.choices = "Please mark at least one answer as correct";
        } else if (draft.choices.some((c) => !c.text?.trim())) {
          errors.choices = "All choices must have text";
        }
      }
    }

    return errors;
  };

  // Step titles
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Question Setup";
      case 2:
        return "Answer Choices";
      case 3:
        return "Review & Details";
      case 4:
        return "Save Question";
      default:
        return "";
    }
  };

  // Save functionality
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave({ ...draft, status: "saved" });
      clearDraft();
      setSaving(false);
      onClose();
    }, 400);
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <QuestionSetupStep
            draft={draft}
            update={update}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
          />
        );
      case 2:
        return (
          <AnswerChoicesStep
            draft={draft}
            setChoice={setChoice}
            addChoice={addChoice}
            removeChoice={removeChoice}
            toggleCorrect={toggleCorrect}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
          />
        );
      case 3:
        return <ReviewStep draft={draft} update={update} />;
      case 4:
        return <SaveStep draft={draft} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-xl font-bold">Create Quiz Question</h2>
              <p className="text-orange-100 text-sm mt-1">
                Step {currentStep} of {totalSteps}: {getStepTitle()}
              </p>
            </div>
            <button
              onClick={() => {
                clearDraft();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 flex items-center justify-center text-white hover:cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderCurrentStep()}
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:cursor-pointer ${
                currentStep === 1
                  ? "text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              aria-label="Previous step"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i + 1 <= currentStep
                      ? "bg-orange-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>

            {currentStep < totalSteps ? (
              <button
                onClick={goToNextStep}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:cursor-pointer shadow-lg hover:shadow-xl"
                aria-label="Next step"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!canSave() || saving}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:cursor-pointer shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                aria-label="Save question"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Question
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const QuestionSetupStep = ({
  draft,
  update,
  selectedCategories,
  toggleCategory,
  validationErrors,
  setValidationErrors,
}: {
  draft: QuizQuestionDraft;
  update: (patch: Partial<QuizQuestionDraft>) => void;
  selectedCategories: BestPracticeCategoryKey[];
  toggleCategory: (categoryKey: BestPracticeCategoryKey) => void;
  validationErrors: Record<string, string>;
  setValidationErrors: (errors: Record<string, string>) => void;
}) => (
  <div className="space-y-6">
    {/* Category Selection */}
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Categories <span className="text-red-500">*</span>
            {selectedCategories.length > 0 && (
              <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full">
                {selectedCategories.length} selected
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Select one or more categories for this quiz question.
          </p>
          {validationErrors.category && (
            <p className="text-xs text-red-500 mt-2">
              {validationErrors.category}
            </p>
          )}
        </div>

        <div
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 ${
            validationErrors.category
              ? "ring-2 ring-red-300 dark:ring-red-700 rounded-xl p-2"
              : ""
          }`}
        >
          {BEST_PRACTICE_CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.key);
            const gradient = getCategoryGradient(category.color);
            return (
              <button
                key={category.key}
                onClick={() => {
                  toggleCategory(category.key as BestPracticeCategoryKey);
                  if (validationErrors.category) {
                    const newErrors = { ...validationErrors };
                    delete newErrors.category;
                    setValidationErrors(newErrors);
                  }
                }}
                className={`p-4 rounded-xl text-left hover:cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? `${gradient.icon} ${gradient.hover} text-white shadow-lg transform scale-105`
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:scale-102"
                }`}
                aria-pressed={isSelected}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{category.name}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>

    {/* Question Prompt */}
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Question Prompt <span className="text-red-500">*</span>
          </h3>
          <textarea
            value={draft.prompt}
            onChange={(e) => {
              update({ prompt: e.target.value });
              if (validationErrors.prompt) {
                const newErrors = { ...validationErrors };
                delete newErrors.prompt;
                setValidationErrors(newErrors);
              }
            }}
            placeholder="Enter your quiz question here..."
            rows={4}
            className={`w-full rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
              validationErrors.prompt
                ? "bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 focus:ring-red-500"
                : "bg-slate-50 dark:bg-slate-700 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-600"
            }`}
          />
          {validationErrors.prompt ? (
            <p className="text-xs text-red-500 mt-2">
              {validationErrors.prompt}
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-2">
              Write a clear, specific question
            </p>
          )}
        </div>

        {/* Question Type */}
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
            Question Type
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                value: "mcq",
                label: "Multiple Choice",
                desc: "One correct answer",
              },
              {
                value: "multi",
                label: "Multiple Select",
                desc: "Multiple correct answers",
              },
              {
                value: "truefalse",
                label: "True/False",
                desc: "Simple true or false",
              },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  update({
                    type: type.value as "mcq" | "multi" | "truefalse",
                    choices:
                      type.value === "truefalse"
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
                  });
                }}
                className={`p-4 rounded-xl text-center hover:cursor-pointer transition-all duration-200 ${
                  draft.type === type.value
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:scale-102"
                }`}
                aria-pressed={draft.type === type.value}
              >
                <div className="space-y-1">
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs opacity-75">{type.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
            Difficulty Level
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "easy", label: "Easy", color: "green" },
              { value: "medium", label: "Medium", color: "yellow" },
              { value: "hard", label: "Hard", color: "red" },
            ].map((difficulty) => (
              <button
                key={difficulty.value}
                onClick={() =>
                  update({
                    difficulty: difficulty.value as "easy" | "medium" | "hard",
                  })
                }
                className={`p-3 rounded-xl text-center hover:cursor-pointer transition-all duration-200 ${
                  draft.difficulty === difficulty.value
                    ? `bg-${difficulty.color}-500 text-white shadow-lg transform scale-105`
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
                aria-pressed={draft.difficulty === difficulty.value}
              >
                <div className="font-medium text-sm">{difficulty.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AnswerChoicesStep = ({
  draft,
  setChoice,
  addChoice,
  removeChoice,
  toggleCorrect,
  validationErrors,
  setValidationErrors,
}: {
  draft: QuizQuestionDraft;
  setChoice: (id: string, patch: Partial<QuizChoice>) => void;
  addChoice: () => void;
  removeChoice: (id: string) => void;
  toggleCorrect: (id: string) => void;
  validationErrors: Record<string, string>;
  setValidationErrors: (errors: Record<string, string>) => void;
}) => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Answer Choices{" "}
            {draft.type !== "truefalse" && (
              <span className="text-red-500">*</span>
            )}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {draft.type === "mcq" &&
              "Set up the possible answers. Mark one as correct."}
            {draft.type === "multi" &&
              "Set up the possible answers. Mark all correct ones."}
            {draft.type === "truefalse" &&
              "True/False answers are automatically set up."}
          </p>
          {validationErrors.choices && (
            <p className="text-xs text-red-500 mt-2">
              {validationErrors.choices}
            </p>
          )}
        </div>

        {draft.type !== "truefalse" ? (
          <>
            <div className="space-y-3">
              {draft.choices.map((choice, idx) => (
                <div
                  key={choice.id}
                  className="flex gap-3 items-center bg-slate-50 dark:bg-slate-700 rounded-xl p-4 group hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      value={choice.text}
                      onChange={(e) => {
                        setChoice(choice.id, { text: e.target.value });
                        if (validationErrors.choices) {
                          const newErrors = { ...validationErrors };
                          delete newErrors.choices;
                          setValidationErrors(newErrors);
                        }
                      }}
                      placeholder={`Answer option ${String.fromCharCode(
                        65 + idx
                      )}`}
                      className="flex-1 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 transition-all duration-200"
                    />
                  </div>
                  <button
                    onClick={() => toggleCorrect(choice.id)}
                    className={`px-4 py-2 text-xs rounded-lg font-medium hover:cursor-pointer transition-all duration-200 ${
                      choice.correct
                        ? "bg-green-500 text-white shadow-lg"
                        : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500"
                    }`}
                    aria-pressed={choice.correct}
                  >
                    {choice.correct ? "✓ Correct" : "Mark Correct"}
                  </button>
                  {draft.choices.length > 2 && (
                    <button
                      onClick={() => removeChoice(choice.id)}
                      className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 hover:cursor-pointer transition-all duration-200 flex items-center justify-center"
                      aria-label={`Remove choice ${String.fromCharCode(
                        65 + idx
                      )}`}
                      title={`Delete option ${String.fromCharCode(65 + idx)}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addChoice}
              className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Answer Choice
            </button>
          </>
        ) : (
          <div className="space-y-3">
            {draft.choices.map((choice) => (
              <div
                key={choice.id}
                className={`flex gap-3 items-center rounded-xl p-4 transition-colors duration-200 ${
                  choice.correct
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    choice.correct
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  }`}
                >
                  {choice.correct ? "T" : "F"}
                </span>
                <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {choice.text}
                </span>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    choice.correct
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  }`}
                >
                  {choice.correct ? "Correct Answer" : "Incorrect Answer"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const ReviewStep = ({
  draft,
  update,
}: {
  draft: QuizQuestionDraft;
  update: (patch: Partial<QuizQuestionDraft>) => void;
}) => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Review Your Question
          </h3>

          {/* Question Preview */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  {CATEGORY_MAP[draft.category]?.name || draft.category}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    draft.difficulty === "easy"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : draft.difficulty === "medium"
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  }`}
                >
                  {draft.difficulty}
                </span>
                <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full">
                  {draft.type === "mcq"
                    ? "Multiple Choice"
                    : draft.type === "multi"
                    ? "Multiple Select"
                    : "True/False"}
                </span>
              </div>
              <p className="text-slate-900 dark:text-slate-100 font-medium">
                {draft.prompt}
              </p>
            </div>

            <div className="space-y-2">
              {draft.choices.map((choice, idx) => (
                <div
                  key={choice.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    choice.correct
                      ? "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600"
                  }`}
                >
                  <span className="w-6 h-6 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 text-sm text-slate-900 dark:text-slate-100">
                    {choice.text}
                  </span>
                  {choice.correct && (
                    <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                      ✓ Correct
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
            Explanation{" "}
            <span className="text-slate-500 text-sm font-normal">
              (Optional)
            </span>
          </h4>
          <textarea
            value={draft.explanation}
            onChange={(e) => update({ explanation: e.target.value })}
            placeholder="Explain why this is the correct answer to help learners understand..."
            rows={4}
            className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 resize-none"
          />
          <p className="text-xs text-slate-500 mt-2">
            Help learners understand why the answer is correct
          </p>
        </div>
      </div>
    </div>
  </div>
);

const SaveStep = ({ draft }: { draft: QuizQuestionDraft }) => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl text-green-600 dark:text-green-400">✓</span>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Ready to Save
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Your quiz question is ready! Click "Save Question" to add it to the{" "}
            {CATEGORY_MAP[draft.category]?.name} category.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Category:
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {CATEGORY_MAP[draft.category]?.name}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Type:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {draft.type === "mcq"
                ? "Multiple Choice"
                : draft.type === "multi"
                ? "Multiple Select"
                : "True/False"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Difficulty:
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">
              {draft.difficulty}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Choices:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {draft.choices.length} options
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
