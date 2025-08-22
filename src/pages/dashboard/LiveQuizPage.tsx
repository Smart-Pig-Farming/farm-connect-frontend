import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  Trophy,
  ArrowLeft,
  ArrowRight,
  Send,
  AlertTriangle,
} from "lucide-react";
import { BEST_PRACTICE_CATEGORIES } from "@/components/bestPractices/constants";
import { getCategoryIcon } from "@/components/bestPractices/iconMap";
import { getQuizSet } from "@/data/quizQuestionsMock";
import type { QuizQuestionDraft } from "@/types/bestPractices";
import type { BestPracticeCategoryKey } from "@/types/bestPractices";

interface AnswerMap {
  [id: string]: string[];
}

// Simplified category colors
const getCategoryColors = (color?: string) => {
  const colorMap = {
    green: {
      primary: "from-green-500 to-emerald-600",
      accent: "green-500",
      light: "green-50",
    },
    red: {
      primary: "from-red-500 to-red-600",
      accent: "red-500",
      light: "red-50",
    },
    teal: {
      primary: "from-teal-500 to-teal-600",
      accent: "teal-500",
      light: "teal-50",
    },
    indigo: {
      primary: "from-indigo-500 to-indigo-600",
      accent: "indigo-500",
      light: "indigo-50",
    },
    purple: {
      primary: "from-purple-500 to-fuchsia-600",
      accent: "purple-500",
      light: "purple-50",
    },
    pink: {
      primary: "from-pink-500 to-rose-500",
      accent: "pink-500",
      light: "pink-50",
    },
    blue: {
      primary: "from-blue-500 to-blue-600",
      accent: "blue-500",
      light: "blue-50",
    },
    amber: {
      primary: "from-amber-500 to-amber-600",
      accent: "amber-500",
      light: "amber-50",
    },
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.amber;
};

export function LiveQuizPage() {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const category = BEST_PRACTICE_CATEGORIES.find((c) => c.key === categoryKey);
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [seconds, setSeconds] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    if (!category) return;
    setQuestions(getQuizSet(category.key));
  }, [categoryKey, category]);

  useEffect(() => {
    if (submitted) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [submitted]);

  const current = questions[index];
  const total = questions.length;

  const toggleChoice = (
    qId: string,
    choiceId: string,
    questionType: string
  ) => {
    setAnswers((prev) => {
      if (questionType === "mcq" || questionType === "truefalse") {
        // Single select: replace any existing selection
        return { ...prev, [qId]: [choiceId] };
      } else {
        // Multi select: toggle selection
        const set = new Set(prev[qId] || []);
        if (set.has(choiceId)) set.delete(choiceId);
        else set.add(choiceId);
        return { ...prev, [qId]: Array.from(set) };
      }
    });
  };

  const score = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    for (const q of questions) {
      const picked = new Set(answers[q.id] || []);
      const correctChoices = q.choices
        .filter((c) => c.correct)
        .map((c) => c.id);
      const correctSet = new Set(correctChoices);
      const allCorrectPicked = correctChoices.every((cid) => picked.has(cid));
      const noWrong = Array.from(picked).every((cid) => correctSet.has(cid));
      if (allCorrectPicked && noWrong) correct++;
    }
    return { correct, total: questions.length };
  }, [submitted, answers, questions]);

  if (!category) return null;

  const CategoryIcon = getCategoryIcon(category.key as BestPracticeCategoryKey);
  const colors = getCategoryColors(category.color);

  // Results Page - Improved
  if (submitted && score) {
    const percentage = score.total
      ? Math.round((score.correct / score.total) * 100)
      : 0;
    const isPassing = percentage >= 70;

    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            {/* Results Header */}
            <div className="mb-8">
              <div
                className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${colors.primary} shadow-lg flex items-center justify-center`}
              >
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-3">
                Quiz Complete!
              </h1>
              <p className="text-slate-600">
                Great job on completing the {category.name} quiz
              </p>
            </div>

            {/* Score Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg mb-8">
              <div className="text-center mb-6">
                <div
                  className={`text-6xl font-bold ${
                    isPassing ? `text-${colors.accent}` : "text-slate-400"
                  } mb-2`}
                >
                  {percentage}%
                </div>
                <p className="text-slate-600 mb-4">
                  {score.correct} out of {score.total} questions correct
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    Completed in {Math.floor(seconds / 60)}m {seconds % 60}s
                  </span>
                </div>
              </div>

              {isPassing ? (
                <div
                  className={`bg-${colors.light} border border-${colors.accent}/20 rounded-2xl p-4`}
                >
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Congratulations! You passed!</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="text-sm text-slate-600">
                    Keep studying! You need 70% to pass.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() =>
                  navigate(
                    `/dashboard/best-practices/category/${category.key}/quiz`
                  )
                }
                className={`px-8 py-3 bg-gradient-to-r ${colors.primary} text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:cursor-pointer`}
              >
                Back to Quiz Center
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 transition-all duration-300 hover:cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No Questions State - Improved
  if (!current) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30`}
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg max-w-md mx-auto">
            <div
              className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${colors.primary} shadow-lg p-4`}
            >
              <CategoryIcon className="w-full h-full text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              No Questions Available
            </h2>
            <p className="text-slate-600 mb-8">
              There are currently no quiz questions for {category.name}. Please
              check back later or contact an administrator.
            </p>
            <button
              onClick={() =>
                navigate(
                  `/dashboard/best-practices/category/${category.key}/quiz`
                )
              }
              className={`w-full px-6 py-3 bg-gradient-to-r ${colors.primary} text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:cursor-pointer`}
            >
              Back to Quiz Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((index + 1) / total) * 100;
  const answeredCurrent = answers[current.id] && answers[current.id].length > 0;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30`}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowExitModal(true)}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors hover:cursor-pointer"
              >
                Exit Quiz
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>
                  {Math.floor(seconds / 60)}:
                  {String(seconds % 60).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Question {index + 1} of {total}
                </span>
                <span className="text-sm text-slate-500">
                  {Math.round(progress)}% complete
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`bg-gradient-to-r ${colors.primary} h-2 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-white/50 shadow-lg mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-relaxed">
              {current.prompt}
            </h2>

            {/* Simple Question Type Text */}
            <p className="text-sm text-slate-500 mb-6">
              {current.type === "multi"
                ? "Select multiple options"
                : "Select one option"}
            </p>

            {/* Answer Choices */}
            <div className="space-y-3">
              {current.choices.map((choice, choiceIndex) => {
                const picked = (answers[current.id] || []).includes(choice.id);
                const isMultiSelect = current.type === "multi";
                return (
                  <button
                    key={choice.id}
                    onClick={() =>
                      toggleChoice(current.id, choice.id, current.type)
                    }
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 hover:cursor-pointer group ${
                      picked
                        ? `border-${colors.accent} bg-gradient-to-r ${colors.primary} text-white shadow-md transform scale-[1.01]`
                        : `border-slate-200 bg-white hover:border-${colors.accent}/40 hover:bg-${colors.light}/10 hover:shadow-sm`
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Choice Indicator */}
                      <div
                        className={`flex-shrink-0 transition-all duration-200 ${
                          isMultiSelect
                            ? `w-5 h-5 rounded border-2 flex items-center justify-center ${
                                picked
                                  ? "bg-white border-white"
                                  : `border-slate-300 group-hover:border-${colors.accent}/50`
                              }`
                            : `w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                picked
                                  ? "bg-white border-white"
                                  : `border-slate-300 group-hover:border-${colors.accent}/50`
                              }`
                        }`}
                      >
                        {isMultiSelect && picked ? (
                          <svg
                            className="w-3 h-3 text-slate-700"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : !isMultiSelect && picked ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        ) : null}
                      </div>

                      {/* Choice Label */}
                      <div className="flex items-center gap-3 flex-1">
                        <span
                          className={`text-sm font-medium ${
                            picked ? "text-white" : "text-slate-500"
                          }`}
                        >
                          {String.fromCharCode(65 + choiceIndex)}
                        </span>
                        <span className="text-base leading-relaxed">
                          {choice.text}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all hover:cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {index < total - 1 ? (
              <button
                onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
                className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r ${colors.primary} text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:cursor-pointer`}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={!answeredCurrent}
                className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer`}
              >
                <Send className="w-4 h-4" />
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Exit Quiz?
              </h3>
            </div>

            <p className="text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to exit this quiz? Your progress will be
              lost and you'll need to start over.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors hover:cursor-pointer"
              >
                Continue Quiz
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  navigate(
                    `/dashboard/best-practices/category/${category.key}/quiz`
                  );
                }}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors hover:cursor-pointer"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Send className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Submit Quiz?
              </h3>
            </div>

            <p className="text-slate-600 mb-6 leading-relaxed">
              Are you ready to submit your quiz? Once submitted, you won't be
              able to change your answers.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors hover:cursor-pointer"
              >
                Review Answers
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSubmitted(true);
                }}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors hover:cursor-pointer"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
