import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  Trophy,
  ArrowLeft,
  ArrowRight,
  Send,
  AlertTriangle,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { BEST_PRACTICE_CATEGORIES } from "@/components/bestPractices/constants";
import { getCategoryIcon } from "@/components/bestPractices/iconMap";
import {
  useGetQuizTagStatsQuery,
  useListQuizzesQuery,
  useStartAttemptMutation,
  useSaveAttemptAnswerMutation,
  useSubmitAttemptMutation,
  useGetAttemptQuery,
} from "@/store/api/quizApi";
import { toast } from "sonner";
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
  // Resolve tag id -> quiz id similar to QuizNavPage
  const tagNameMap: Record<string, string> = {
    feeding_nutrition: "Feeding & Nutrition",
    disease_control: "Disease Control",
    growth_weight: "Growth & Weight Mgmt",
    environment_management: "Environment Mgmt",
    breeding_insemination: "Breeding & Insemination",
    farrowing_management: "Farrowing Mgmt",
    record_management: "Record & Farm Mgmt",
    marketing_finance: "Marketing & Finance",
  };
  const expectedTagName = category ? tagNameMap[category.key] : undefined;
  const {
    data: tagStats,
    isLoading: loadingTagStats,
    isError: tagStatsError,
    refetch: refetchTagStats,
  } = useGetQuizTagStatsQuery(undefined, {
    skip: !category,
  });
  const matchedTag = tagStats?.tags.find((t) => t.tag_name === expectedTagName);
  const tagId = matchedTag?.tag_id;
  const {
    data: quizzesData,
    isLoading: loadingQuizList,
    isError: quizListError,
    refetch: refetchQuizzes,
  } = useListQuizzesQuery(
    tagId ? { tag_id: tagId, limit: 1, active: true } : undefined,
    { skip: !tagId }
  );
  const quizId = quizzesData?.items?.[0]?.id;

  const PASSING_SCORE = quizzesData?.items?.[0]?.passing_score ?? 70; // percentage
  // Backend sends quiz.duration in minutes; we derive seconds only after attempt start using expires_at.
  const QUIZ_DURATION_MINUTES = quizzesData?.items?.[0]?.duration ?? 10;

  // Attempt lifecycle
  const [startAttempt, { isLoading: startingAttempt }] =
    useStartAttemptMutation();
  const [saveAnswer] = useSaveAttemptAnswerMutation();
  const [submitAttempt, { isLoading: submittingAttempt }] =
    useSubmitAttemptMutation();
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const { data: attemptDetail, isFetching: fetchingAttempt } =
    useGetAttemptQuery(
      { quizId: quizId as number, attemptId: attemptId as number },
      { skip: !quizId || !attemptId }
    );

  interface UIQuestionChoice {
    id: string;
    text: string;
  }
  interface UIQuestion {
    id: string; // string for local answer map access
    prompt: string;
    type: string; // mcq | multi | truefalse (normalized)
    choices: UIQuestionChoice[];
  }
  // Normalize backend question types into a stable internal set
  const normalizeQuestionType = (
    raw: string
  ): "mcq" | "multi" | "truefalse" => {
    if (!raw) return "mcq";
    const lower = raw.toLowerCase();
    if (lower === "multiple") return "multi"; // multi-select
    if (lower === "truefalse" || lower === "true_false" || lower === "boolean")
      return "truefalse";
    return "mcq";
  };
  const [questions, setQuestions] = useState<UIQuestion[]>([]);
  const [questionSource, setQuestionSource] = useState<
    "start" | "attemptDetail" | "localStorage" | null
  >(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({}); // local mirror for immediate UI response
  // Remaining seconds (null until first attempt payload applied to avoid 0:00 flash)
  const [remaining, setRemaining] = useState<number | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Holds the immediate submit response (score & breakdown) so we don't wait for refetch
  const [submitResult, setSubmitResult] = useState<{
    score_percent: number;
    score_raw: number;
    passed: boolean;
    time_exceeded: boolean;
    total_questions?: number;
  } | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [startErrorCode, setStartErrorCode] = useState<string | null>(null);
  const [partialInfo, setPartialInfo] = useState<{
    requested: number;
    served: number;
    shortfall: number;
  } | null>(null);
  const [dataIntegrityIssue, setDataIntegrityIssue] = useState<string | null>(
    null
  );
  // Guard to prevent duplicate start calls (e.g., React StrictMode double effect)
  const [startInvoked, setStartInvoked] = useState(false);
  // Progressive start status & auto-retry
  const MAX_AUTO_RETRIES = 2;
  const [startStatus, setStartStatus] = useState<{
    phase: "idle" | "request" | "mapping" | "retry_wait" | "success" | "failed";
    attempt: number; // retry attempt counter
    nextRetryAt?: number | null;
    message: string;
  }>({
    phase: "idle",
    attempt: 0,
    nextRetryAt: null,
    message: "Initializing…",
  });
  const retryCountRef = useRef(0);
  const countdownIntervalRef = useRef<number | null>(null);
  const [retryMsRemaining, setRetryMsRemaining] = useState(0);
  // Auto-recovery: React 18 StrictMode double-invokes effects in dev. Our start effect sets startInvoked=true
  // before the second pass; the mutation call from the first pass is aborted during cleanup leaving us "stuck".
  // This watcher detects that stuck state (no attemptId, not loading, no questions) and clears the guard so the
  // effect can fire again automatically (removing need for manual Retry button in most cases).
  useEffect(() => {
    if (
      startInvoked &&
      !startingAttempt &&
      !attemptId &&
      questions.length === 0 &&
      quizId
    ) {
      const t = setTimeout(() => {
        // Only reset if still stuck
        setStartInvoked(false);
        if (startStatus.phase === "idle") {
          setStartStatus({
            phase: "request",
            attempt: 0,
            message: "Building question set…",
            nextRetryAt: null,
          });
        }
      }, 400);
      return () => clearTimeout(t);
    }
  }, [
    startInvoked,
    startingAttempt,
    attemptId,
    questions.length,
    quizId,
    startStatus.phase,
  ]);

  // Handle retry_wait countdown
  useEffect(() => {
    if (startStatus.phase !== "retry_wait" || !startStatus.nextRetryAt) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setRetryMsRemaining(0);
      return;
    }
    const tick = () => {
      const ms = startStatus.nextRetryAt! - Date.now();
      setRetryMsRemaining(ms > 0 ? ms : 0);
      if (ms <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setStartInvoked(false); // allow effect to refire
      }
    };
    tick();
    countdownIntervalRef.current = window.setInterval(tick, 100);
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [startStatus]);

  // Debug state logging
  useEffect(() => {
    console.debug("[LiveQuizPage:state]", {
      quizId,
      attemptId,
      startInvoked,
      startingAttempt,
      questions: questions.length,
    });
  }, [quizId, attemptId, startInvoked, startingAttempt, questions.length]);

  // Resume attempt from localStorage
  useEffect(() => {
    if (!quizId) return;
    const key = `quiz_attempt_${quizId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored) as { attemptId: number };
      if (parsed.attemptId) setAttemptId(parsed.attemptId);
      if (parsed.attemptId) setQuestionSource((prev) => prev || "localStorage");
    }
  }, [quizId]);

  const handleSubmit = useCallback(async () => {
    if (!quizId || !attemptId) return;
    try {
      const payloadAnswers = Object.entries(answers).map(
        ([qId, optionIds]) => ({
          question_id: Number(qId),
          option_ids: optionIds.map(Number),
        })
      );
      const res = await submitAttempt({
        quizId,
        attemptId,
        answers: payloadAnswers,
      }).unwrap();
      setSubmitted(true);
      setSubmitResult({
        score_percent: res.attempt.score_percent,
        score_raw: res.attempt.score_raw,
        passed: res.attempt.passed,
        time_exceeded: res.attempt.time_exceeded,
        total_questions: res.attempt.total_questions,
      });
      localStorage.removeItem(`quiz_attempt_${quizId}`);
      toast.success(
        res.attempt.passed ? "Quiz submitted & passed" : "Quiz submitted"
      );
    } catch (e) {
      const message =
        typeof e === "object" && e && "data" in e
          ? // @ts-expect-error dynamic
            e.data?.message
          : null;
      toast.error(message || "Failed to submit quiz");
    }
  }, [quizId, attemptId, answers, submitAttempt]);

  // Start or resume attempt: always fetch questions snapshot (prevents empty resume state)
  useEffect(() => {
    console.debug("[LiveQuizPage] Start attempt effect triggered", {
      quizId,
      startInvoked,
      attemptId,
      questionsLength: questions.length,
      startingAttempt,
    });

    if (!quizId) {
      console.debug("[LiveQuizPage] No quizId, skipping start attempt");
      return;
    }

    if (startInvoked) {
      console.debug("[LiveQuizPage] Start already invoked, skipping");
      return;
    }

    // Trigger if we have no attempt OR we have attempt but no questions yet
    if (attemptId && questions.length > 0) {
      console.debug(
        "[LiveQuizPage] Already have attempt and questions, skipping"
      );
      return;
    }

    console.log("[LiveQuizPage] Starting quiz attempt for quiz ID:", quizId);
    setStartInvoked(true);
    setStartStatus((s) => ({
      ...s,
      phase: "request",
      message: s.attempt > 0 ? "Retrying…" : "Building question set…",
    }));

    (async () => {
      try {
        console.log("[LiveQuizPage] Calling startAttempt mutation...");
        const res = await startAttempt({ id: quizId }).unwrap();
        console.log(
          "[LiveQuizPage] startAttempt SUCCESS - Full response:",
          res
        );

        setStartStatus((s) => ({
          ...s,
          phase: "mapping",
          message: "Preparing questions…",
        }));
        console.debug("[LiveQuizPage] startAttempt response analysis:", {
          served: res.served_question_count,
          requested: res.requested_question_count,
          partial: res.partial_set,
          questionsArray: Array.isArray(res.questions),
          questionsLength: Array.isArray(res.questions)
            ? res.questions.length
            : null,
          attemptId: res.attempt?.id,
          expiresAt: res.attempt?.expires_at,
        });
        if (!attemptId) {
          setAttemptId(res.attempt.id);
          localStorage.setItem(
            `quiz_attempt_${quizId}`,
            JSON.stringify({ attemptId: res.attempt.id })
          );
        }
        const mapped: UIQuestion[] = Array.isArray(res.questions)
          ? res.questions.map((q, index) => {
              try {
                console.debug(`[LiveQuizPage] Mapping question ${index}:`, {
                  id: q.id,
                  text: q.text,
                  prompt: q.prompt,
                  type: q.type,
                  optionsCount: q.options?.length || 0,
                  hasOptions: Array.isArray(q.options),
                  firstOption: q.options?.[0],
                });

                const maybePrompt = q.prompt || q.text;
                const mappedQuestion = {
                  id: String(q.id),
                  prompt: maybePrompt,
                  type: normalizeQuestionType(q.type),
                  choices: Array.isArray(q.options)
                    ? q.options.map((o) => ({
                        id: String(o.id),
                        text: o.text,
                      }))
                    : [],
                };

                console.debug(
                  `[LiveQuizPage] Successfully mapped question ${index}:`,
                  mappedQuestion
                );
                return mappedQuestion;
              } catch (error) {
                console.error(
                  `[LiveQuizPage] Error mapping question ${index}:`,
                  error,
                  q
                );
                throw error;
              }
            })
          : [];

        console.debug("[LiveQuizPage] All questions mapped successfully:", {
          totalMapped: mapped.length,
          expectedCount:
            res.served_question_count || res.questions?.length || 0,
        });

        setQuestions(mapped);
        setQuestionSource("start");
        if ((res.served_question_count || 0) > 0 && mapped.length === 0) {
          setDataIntegrityIssue(
            "Questions returned from server but failed to map in client."
          );
        } else {
          setDataIntegrityIssue(null);
        }
        if (res.partial_set) {
          setPartialInfo({
            requested: res.requested_question_count || mapped.length,
            served: res.served_question_count || mapped.length,
            shortfall: res.shortfall || 0,
          });
        } else {
          setPartialInfo(null);
        }
        if (res.attempt.expires_at) {
          const exp = new Date(res.attempt.expires_at).getTime();
          const now = Date.now();
          const remainingSec = Math.max(0, Math.floor((exp - now) / 1000));
          setRemaining(remainingSec);
        } else {
          // Fallback if expires_at missing (shouldn't happen): use quiz duration minutes
          setRemaining(QUIZ_DURATION_MINUTES * 60);
        }
        if (res.reused) {
          toast.info("Resumed existing attempt");
        }

        console.log("[LiveQuizPage] Setting start status to SUCCESS");
        setStartStatus((s) => ({ ...s, phase: "success", message: "Ready" }));

        // Debug: Log final state after all updates
        console.log("[LiveQuizPage] SUCCESS - Final state check:", {
          attemptIdWillBe: res.attempt.id,
          questionsWillBe: mapped.length,
          currentAttemptId: attemptId,
          currentQuestions: questions.length,
          expectedTransition: "Should hide progressive start screen",
        });
      } catch (e: unknown) {
        console.error("[LiveQuizPage] startAttempt FAILED:", e);
        console.error("[LiveQuizPage] Error type:", typeof e);
        console.error("[LiveQuizPage] Error details:", {
          hasData: typeof e === "object" && e && "data" in e,
          hasStatus: typeof e === "object" && e && "status" in e,
          hasMessage: typeof e === "object" && e && "message" in e,
          errorObject: e,
        });

        let message: string | null = null;
        let code: string | undefined;
        let status: number | undefined;

        if (typeof e === "object" && e) {
          // RTK Query error format
          if ("data" in e) {
            const anyErr = e as Record<string, unknown>;
            const dataUnknown = anyErr["data"] as unknown;
            if (dataUnknown && typeof dataUnknown === "object") {
              const d = dataUnknown as Record<string, unknown>;
              if (typeof d.error === "string") message = d.error;
              else if (typeof d.message === "string") message = d.message;
              if (typeof d.code === "string") code = d.code;
            }
          }

          // HTTP status
          if ("status" in e) {
            const maybeStatus = (e as Record<string, unknown>)["status"];
            if (typeof maybeStatus === "number") status = maybeStatus;
          }

          // Network/fetch errors
          if ("message" in e) {
            const maybeMsg = (e as Record<string, unknown>)["message"];
            if (typeof maybeMsg === "string") message = message || maybeMsg;
          }
        }

        console.error("[LiveQuizPage] Parsed error info:", {
          message,
          code,
          status,
        });

        // Handle specific error codes
        if (code === "NO_QUESTIONS") {
          message = "This quiz has no active questions yet.";
        } else if (code === "INSUFFICIENT_QUESTIONS") {
          message = "Quiz requires at least 10 active questions to start.";
        } else if (code === "Too many active attempts") {
          message = "You have too many active attempts. Submit or wait.";
        } else if (code === "QUESTIONS_WITHOUT_OPTIONS") {
          message =
            "Some questions have no answer options configured (admin fix required).";
        } else if (code === "NO_OPTIONS") {
          message =
            "No questions with options available. Please contact an administrator.";
        } else if (status === 404) {
          message = "Quiz not found. Please check the quiz ID.";
        } else if (status === 401 || status === 403) {
          message = "Authentication required. Please log in again.";
        } else if (status === 500) {
          message = "Server error. Please try again later.";
        } else if (!message && status) {
          message = `Request failed with status ${status}`;
        }

        const msg = message || "Failed to load quiz attempt - unknown error";
        console.error("[LiveQuizPage] Final error message:", msg);
        setStartError(msg);
        setStartErrorCode(code || null);
        const transient =
          !/no active questions/i.test(msg) && !/at least 10 active/i.test(msg);
        if (transient && retryCountRef.current < MAX_AUTO_RETRIES) {
          retryCountRef.current += 1;
          const delay = 600 + retryCountRef.current * 400;
          setStartStatus({
            phase: "retry_wait",
            attempt: retryCountRef.current,
            message: `Retrying (${retryCountRef.current}/${MAX_AUTO_RETRIES})…`,
            nextRetryAt: Date.now() + delay,
          });
          // Clear visible error during automatic retries
          setStartError(null);
        } else {
          if (transient) toast.error(msg);
          setStartStatus((s) => ({
            ...s,
            phase: "failed",
            message: "Unable to start automatically.",
          }));
        }
        // Reset guard so effect can choose to restart after countdown
        setStartInvoked(false);
      } finally {
        if (startStatus.phase !== "retry_wait") {
          setStartInvoked(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    quizId,
    startAttempt,
    startInvoked,
    QUIZ_DURATION_MINUTES,
    startingAttempt,
  ]);

  const showProgressiveStart =
    !attemptId &&
    questions.length === 0 &&
    startStatus.phase !== "success" &&
    !submitted &&
    !startErrorCode;

  // Debug: Log why we're showing/hiding the progressive start screen
  console.log("[LiveQuizPage] Progressive start condition check:", {
    showProgressiveStart,
    attemptId,
    questionsLength: questions.length,
    startStatusPhase: startStatus.phase,
    submitted,
    startErrorCode,
    breakdown: {
      noAttemptId: !attemptId,
      noQuestions: questions.length === 0,
      notSuccess: startStatus.phase !== "success",
      notSubmitted: !submitted,
      noErrorCode: !startErrorCode,
    },
  });

  const progressiveStartContent = (() => {
    if (!showProgressiveStart) return null;
    const colors = getCategoryColors(category?.color);
    const waitingRetry = startStatus.phase === "retry_wait";
    const pct =
      startStatus.phase === "mapping"
        ? 70
        : startStatus.phase === "request"
        ? 35
        : waitingRetry
        ? 90
        : 15;
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30 px-4`}
      >
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg text-center border border-white/60">
          <div
            className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${colors.primary} shadow-lg flex items-center justify-center relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
            <Loader2 className="w-10 h-10 text-white animate-spin-slow relative z-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Preparing Quiz
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            {startStatus.message}
            {waitingRetry && startStatus.nextRetryAt && (
              <span className="block mt-1 text-xs text-slate-500">
                Retrying in {(retryMsRemaining / 1000).toFixed(1)}s
              </span>
            )}
          </p>
          <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
            <div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.primary}`}
              style={{ width: `${pct}%`, transition: "width .4s ease" }}
            />
          </div>
          <div className="flex items-center justify-center gap-1 mb-8">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${colors.primary} animate-bounce`}
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button
              disabled={
                startStatus.phase === "request" ||
                startStatus.phase === "mapping" ||
                waitingRetry
              }
              onClick={() => {
                retryCountRef.current = 0;
                setStartStatus({
                  phase: "request",
                  attempt: 0,
                  message: "Building question set…",
                  nextRetryAt: null,
                });
                setStartInvoked(false);
              }}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${colors.primary} text-white rounded-2xl font-semibold shadow hover:shadow-lg disabled:opacity-60 transition-all hover:cursor-pointer`}
            >
              {(startStatus.phase === "request" ||
                startStatus.phase === "mapping") && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}{" "}
              {waitingRetry ? "Waiting…" : "Retry Now"}
            </button>
            <button
              onClick={() =>
                navigate(
                  `/dashboard/best-practices/category/${category?.key}/quiz`
                )
              }
              className="w-full px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 transition-all hover:cursor-pointer"
            >
              Exit
            </button>
          </div>
          <div className="mt-6 text-left text-[10px] leading-relaxed font-mono text-slate-400 whitespace-pre-wrap">
            phase: {startStatus.phase}\nretry: {retryCountRef.current}/
            {MAX_AUTO_RETRIES}\ninvoked: {String(startInvoked)}
          </div>
        </div>
      </div>
    );
  })();

  // Populate answers from attempt detail (resume)
  useEffect(() => {
    type AttemptDetailLike = { answers?: Record<string, number[]> };
    const backendAnswers: Record<string, number[]> | undefined = (
      attemptDetail as unknown as AttemptDetailLike
    )?.answers;
    if (!backendAnswers) return;
    const map: AnswerMap = {};
    Object.entries(backendAnswers).forEach(([qid, arr]) => {
      map[qid] = (arr as number[]).map(String);
    });
    setAnswers((prev) => ({ ...map, ...prev }));
  }, [attemptDetail]);

  // Fallback populate questions from getAttempt detail if startAttempt mapping failed
  useEffect(() => {
    if (questions.length > 0) return;
    if (!attemptDetail) return;
    const rawDetail = attemptDetail as unknown as { questions?: unknown };
    const qArr = Array.isArray(rawDetail.questions)
      ? (rawDetail.questions as unknown[])
      : [];
    if (qArr.length === 0) return;
    const mapped: UIQuestion[] = qArr.map((qRaw) => {
      const qObj = qRaw as Record<string, unknown>;
      const rawOptions = qObj["options"];
      const optArr = Array.isArray(rawOptions) ? rawOptions : [];
      const idVal = qObj["id"] !== undefined ? qObj["id"] : qObj["question_id"];
      const rawType = qObj["type"] !== undefined ? String(qObj["type"]) : "mcq";
      const rawPrompt =
        qObj["prompt"] !== undefined
          ? qObj["prompt"]
          : (qObj["text"] as unknown) || "";
      return {
        id: String(idVal ?? ""),
        prompt: String(rawPrompt ?? ""),
        type: normalizeQuestionType(String(rawType)),
        choices: optArr.map((o) => {
          const oo = o as Record<string, unknown>;
          return { id: String(oo.id), text: String(oo.text) };
        }),
      };
    });
    setQuestions(mapped);
    if (!questionSource) setQuestionSource("attemptDetail");
    const zero = mapped.filter((m) => m.choices.length === 0).map((m) => m.id);
    if (zero.length) {
      setDataIntegrityIssue(
        `Some mapped questions have no options (ids: ${zero.join(",")})`
      );
    }
  }, [attemptDetail, questions.length, questionSource]);

  // Timer countdown (server authoritative via expires_at; here just UI ticking)
  useEffect(() => {
    if (submitted) return;
    if (remaining === null) return; // not initialized yet
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => (r !== null && r > 0 ? r - 1 : r));
    }, 1000);
    return () => clearInterval(id);
  }, [submitted, remaining]);

  // Auto submit on time expiry
  useEffect(() => {
    if (
      !submitted &&
      remaining === 0 &&
      remaining !== null &&
      attemptId &&
      quizId
    ) {
      setTimeExpired(true);
      handleSubmit();
    }
  }, [remaining, submitted, attemptId, quizId, handleSubmit]);

  const current = questions[index];
  const total = questions.length;

  const persistAnswer = useCallback(
    async (qId: string, nextSelected: string[]) => {
      if (!attemptId || !quizId) return;
      try {
        await saveAnswer({
          quizId,
          attemptId,
          question_id: Number(qId),
          option_ids: nextSelected.map(Number),
        }).unwrap();
      } catch {
        toast.error("Failed to save answer");
      }
    },
    [attemptId, quizId, saveAnswer]
  );

  if (progressiveStartContent) return progressiveStartContent;

  const toggleChoice = (
    qId: string,
    choiceId: string,
    questionType: string
  ) => {
    setAnswers((prev) => {
      let next: string[] = [];
      if (questionType === "mcq" || questionType === "truefalse") {
        next = [choiceId];
      } else {
        const set = new Set(prev[qId] || []);
        if (set.has(choiceId)) set.delete(choiceId);
        else set.add(choiceId);
        next = Array.from(set);
      }
      const updated = { ...prev, [qId]: next };
      persistAnswer(qId, next);
      return updated;
    });
  };

  // We don't have correctness locally; treat local score as unknown until submitted.
  // Placeholder: could refetch attempt for score details after submission.

  if (!category) {
    console.log("Rendering: Category not found");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50/30 px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-sm w-full text-center">
          <p className="text-slate-600 mb-6">Category not found.</p>
          <button
            onClick={() => navigate("/dashboard/best-practices")}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow hover:shadow-lg hover:scale-[1.02] transition-all hover:cursor-pointer"
          >
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(category.key as BestPracticeCategoryKey);
  const colors = getCategoryColors(category.color);

  // Derived states for resolution
  const resolvingQuizMeta =
    loadingTagStats ||
    loadingQuizList ||
    (!quizId && (loadingTagStats || loadingQuizList));
  const quizMetaError = tagStatsError || quizListError;
  const noActiveQuiz = !resolvingQuizMeta && !quizMetaError && !quizId;

  // Loading UI while resolving which quiz to start
  if (resolvingQuizMeta && !attemptId) {
    const colors = getCategoryColors(category.color);
    const CategoryIcon = getCategoryIcon(
      category.key as BestPracticeCategoryKey
    );
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30 px-4`}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg max-w-md w-full text-center">
          <div
            className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${colors.primary} shadow-lg flex items-center justify-center`}
          >
            <CategoryIcon className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Preparing Your Quiz
          </h2>
          <p className="text-slate-600 text-sm">
            Loading quiz configuration and questions...
          </p>
        </div>
      </div>
    );
  }

  // Error resolving quiz metadata
  if (quizMetaError && !attemptId) {
    const colors = getCategoryColors(category.color);
    const CategoryIcon = getCategoryIcon(
      category.key as BestPracticeCategoryKey
    );
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30 px-4`}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg max-w-md w-full text-center">
          <div
            className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${colors.primary} shadow-lg flex items-center justify-center`}
          >
            <CategoryIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Failed to Load Quiz
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            We couldn't retrieve quiz data. Please retry.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                refetchTagStats();
                refetchQuizzes();
              }}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${colors.primary} text-white rounded-2xl font-semibold shadow hover:shadow-lg transition-all hover:cursor-pointer`}
            >
              <RefreshCcw className="w-4 h-4" /> Retry
            </button>
            <button
              onClick={() =>
                navigate(
                  `/dashboard/best-practices/category/${category.key}/quiz`
                )
              }
              className="w-full px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 transition-all hover:cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No active quiz configured
  if (noActiveQuiz) {
    const colors = getCategoryColors(category.color);
    const CategoryIcon = getCategoryIcon(
      category.key as BestPracticeCategoryKey
    );
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30 px-4`}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg max-w-md w-full text-center">
          <div
            className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${colors.primary} shadow-lg flex items-center justify-center`}
          >
            <CategoryIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            No Active Quiz
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            An active quiz hasn't been configured for this category yet.
          </p>
          <button
            onClick={() =>
              navigate(
                `/dashboard/best-practices/category/${category.key}/quiz`
              )
            }
            className={`w-full px-6 py-3 bg-gradient-to-r ${colors.primary} text-white rounded-2xl font-semibold shadow hover:shadow-lg transition-all hover:cursor-pointer`}
          >
            Back to Quiz Center
          </button>
        </div>
      </div>
    );
  }

  // Attempt is currently being created (metadata resolved) -> show loading UI
  if (startingAttempt && !attemptId && !resolvingQuizMeta && !startError) {
    const colors = getCategoryColors(category.color);
    const CategoryIcon = getCategoryIcon(
      category.key as BestPracticeCategoryKey
    );
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30 px-4`}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg max-w-md w-full text-center">
          <div
            className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${colors.primary} shadow-lg flex items-center justify-center`}
          >
            <CategoryIcon className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Starting Your Attempt
          </h2>
          <p className="text-slate-600 text-sm">
            Building a question set for you...
          </p>
        </div>
      </div>
    );
  }

  // Attempt starting error (after quiz meta resolved)
  if (startError && !attemptId) {
    const colors = getCategoryColors(category.color);
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30 px-4`}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Unable to Start Quiz
          </h2>
          <p className="text-slate-600 text-sm mb-4">{startError}</p>
          {startErrorCode === "QUESTIONS_WITHOUT_OPTIONS" && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              Some quiz questions are missing answer options. An administrator
              needs to edit or remove those questions.
            </p>
          )}
          {startErrorCode === "NO_OPTIONS" && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              All retrieved questions lacked options. Please report this issue.
            </p>
          )}
          <div className="flex flex-col gap-3">
            <button
              disabled={startingAttempt}
              onClick={() => {
                setStartError(null);
                setStartErrorCode(null);
                /* triggers effect retry by clearing attemptId */ setAttemptId(
                  null
                );
              }}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${colors.primary} text-white rounded-2xl font-semibold shadow hover:shadow-lg disabled:opacity-60 transition-all hover:cursor-pointer`}
            >
              {startingAttempt && <Loader2 className="w-4 h-4 animate-spin" />}{" "}
              Retry
            </button>
            <button
              onClick={() =>
                navigate(
                  `/dashboard/best-practices/category/${category.key}/quiz`
                )
              }
              className="w-full px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 transition-all hover:cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results Page - Improved
  if (submitted) {
    // After submission we don't yet have score_percent (would need getAttempt/refetch). For now show simple message.
    const elapsed = QUIZ_DURATION_MINUTES * 60 - (remaining ?? 0);
    // Prefer immediate submitResult, fallback to attemptDetail if user navigated back to a completed attempt
    const percentage = submitResult
      ? submitResult.score_percent
      : attemptDetail?.attempt?.score_percent ?? null;
    const correctRaw = submitResult
      ? submitResult.score_raw
      : attemptDetail?.attempt?.score_raw ?? null;
    const isPassing = percentage !== null ? percentage >= PASSING_SCORE : false;

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
                  {percentage !== null ? (
                    `${percentage}%`
                  ) : submittingAttempt ? (
                    <span className="inline-flex items-center gap-2 text-base font-normal text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Scoring...</span>
                    </span>
                  ) : (
                    "--"
                  )}
                </div>
                <p className="text-slate-600 mb-4">
                  {correctRaw !== null && submitResult
                    ? `${correctRaw} correct out of ${
                        submitResult.total_questions || "?"
                      }`
                    : submittingAttempt
                    ? "Submitting answers..."
                    : "Results processing"}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    {timeExpired ? "Time limit reached" : "Completed in"}{" "}
                    {Math.floor(elapsed / 60)}m {elapsed % 60}s
                  </span>
                </div>
              </div>

              {isPassing ? (
                <div
                  className={`bg-${colors.light} border border-${colors.accent}/20 rounded-2xl p-4`}
                >
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {percentage !== null
                        ? "Congratulations! You passed!"
                        : submittingAttempt
                        ? "Scoring your attempt..."
                        : "Submission received"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="text-sm text-slate-600">
                    {percentage === null
                      ? submittingAttempt
                        ? "Finalizing your score..."
                        : "Your results are being processed."
                      : `Keep studying! You need ${PASSING_SCORE}% to pass.`}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
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
              {quizId && attemptId && submitResult && (
                <button
                  onClick={() =>
                    navigate(
                      `/dashboard/best-practices/category/${category.key}/quiz/review/${quizId}/${attemptId}`
                    )
                  }
                  className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 transition-all duration-300 hover:cursor-pointer"
                >
                  View Details
                </button>
              )}
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

  // No Questions State - Improved (quiz exists but zero questions)
  if (
    attemptId &&
    total === 0 &&
    !startingAttempt &&
    !fetchingAttempt &&
    !dataIntegrityIssue
  ) {
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
              Quiz Not Ready
            </h2>
            <p className="text-slate-600 mb-8">
              This quiz doesn't have any active questions configured yet. Your
              attempt wasn't started with questions. Please check back later or
              contact an administrator to add questions.
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

  // Skeleton while questions loading after attempt start
  if (!current && (startingAttempt || fetchingAttempt)) {
    if (!category) {
      // This case should be rare, but guards against a blank page if category is resolving slowly
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
        </div>
      );
    }
    const colors = getCategoryColors(category.color);
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30 px-4`}
      >
        <div className="max-w-xl w-full bg-white/80 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg animate-pulse">
          <div className="h-5 w-40 bg-slate-200 rounded mb-6"></div>
          <div className="space-y-4 mb-8">
            <div className="h-4 w-5/6 bg-slate-200 rounded" />
            <div className="h-4 w-2/3 bg-slate-200 rounded" />
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full bg-slate-200/70 rounded-xl" />
            ))}
          </div>
          <div className="mt-10 h-10 w-40 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const progress = total ? ((index + 1) / total) * 100 : 0;
  const lastMinute = remaining !== null && remaining <= 60;
  const minutes = remaining !== null ? Math.floor(remaining / 60) : 0;
  const seconds = remaining !== null ? remaining % 60 : 0;
  const answeredCurrent = current
    ? (answers[current.id]?.length ?? 0) > 0
    : false;

  // Fallback diagnostic UI: catches edge case where no conditional branch rendered content
  if (
    !current &&
    !startingAttempt &&
    !fetchingAttempt &&
    !submitted &&
    !startError &&
    category &&
    quizId &&
    !dataIntegrityIssue
  ) {
    // Data integrity fallback (server gave questions but client state empty)
    if (dataIntegrityIssue && attemptId && !current) {
      const colors = getCategoryColors(category.color);
      return (
        <div
          className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30 px-4`}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Quiz Data Issue
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              {dataIntegrityIssue}. This usually indicates a client parsing
              error. Try reloading; if it persists, please report.
            </p>
            <div className="text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5 space-y-1">
              <div>attemptId: {attemptId}</div>
              <div>questions(local): {questions.length}</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className={`flex-1 px-5 py-3 rounded-xl bg-gradient-to-r ${colors.primary} text-white text-sm font-semibold shadow hover:shadow-md transition-colors hover:cursor-pointer`}
              >
                Reload
              </button>
              <button
                onClick={() => {
                  setAttemptId(null);
                  setQuestions([]);
                  setAnswers({});
                  setDataIntegrityIssue(null);
                  localStorage.removeItem(`quiz_attempt_${quizId}`);
                }}
                className="flex-1 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors hover:cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      );
    }
    const colors = getCategoryColors(category.color);
    const handleForceRetry = async () => {
      try {
        // Reset local attempt state to force a clean start
        setAttemptId(null);
        setQuestions([]);
        setAnswers({});
        setRemaining(null);
        setStartInvoked(false);
        localStorage.removeItem(`quiz_attempt_${quizId}`);
        // Trigger start explicitly
        try {
          const res = await startAttempt({ id: quizId }).unwrap();
          if (!res) return;
          setAttemptId(res.attempt.id);
          localStorage.setItem(
            `quiz_attempt_${quizId}`,
            JSON.stringify({ attemptId: res.attempt.id })
          );
          const mapped: UIQuestion[] = res.questions.map(
            (q: {
              id: number;
              prompt?: string;
              text: string;
              type: string;
              options: { id: number; text: string }[];
            }) => ({
              id: String(q.id),
              prompt: q.prompt || q.text,
              type: normalizeQuestionType(q.type),
              choices: q.options.map((o: { id: number; text: string }) => ({
                id: String(o.id),
                text: o.text,
              })),
            })
          );
          setQuestions(mapped);
          if (res.attempt.expires_at) {
            const exp = new Date(res.attempt.expires_at).getTime();
            const now = Date.now();
            setRemaining(Math.max(0, Math.floor((exp - now) / 1000)));
          }
        } catch (e) {
          console.error("[LiveQuizPage:forceRetry]", e);
          toast.error("Retry failed");
        }
      } catch {
        /* swallow */
      }
    };
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30 px-4`}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg max-w-lg w-full">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Preparing Quiz
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            We're still waiting for questions to load. This can happen if the
            initial attempt request never fired or returned an unexpected shape.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-600 mb-5 space-y-1 overflow-auto max-h-40">
            <div>quizId: {quizId}</div>
            <div>attemptId: {attemptId ?? "null"}</div>
            <div>questions.length: {questions.length}</div>
            <div>startingAttempt: {String(startingAttempt)}</div>
            <div>fetchingAttempt: {String(fetchingAttempt)}</div>
            <div>startInvoked: {String(startInvoked)}</div>
            <div>remaining: {remaining === null ? "null" : remaining}</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleForceRetry}
              className={`flex-1 px-5 py-3 rounded-xl bg-gradient-to-r ${colors.primary} text-white text-sm font-semibold shadow hover:shadow-md transition-colors hover:cursor-pointer`}
            >
              Retry Start
            </button>
            <button
              onClick={() =>
                navigate(
                  `/dashboard/best-practices/category/${category.key}/quiz`
                )
              }
              className="flex-1 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors hover:cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30`}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with Progress - gated until questions & timer initialized */}
          {total > 0 && remaining !== null && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowExitModal(true)}
                  className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors hover:cursor-pointer"
                >
                  Exit Quiz
                </button>
                <div
                  className={`flex items-center gap-2 text-sm bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all ${
                    lastMinute
                      ? "text-red-600 ring-2 ring-red-400 animate-pulse"
                      : "text-slate-600"
                  }`}
                  aria-live={lastMinute ? "assertive" : undefined}
                  aria-label={`Time remaining ${minutes} minutes ${seconds} seconds`}
                >
                  <Clock
                    className={`w-4 h-4 ${lastMinute ? "text-red-600" : ""}`}
                  />
                  <span>
                    {minutes}:{String(seconds).padStart(2, "0")}
                  </span>
                  {questionSource && (
                    <span className="ml-3 text-[10px] tracking-wide uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                      {questionSource === "start"
                        ? "from start"
                        : questionSource === "attemptDetail"
                        ? "from attempt detail"
                        : "from storage"}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    {`Question ${index + 1} of ${total}`}
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
          )}

          {/* Question Card + Navigation (guarded) */}
          {current ? (
            <>
              {partialInfo && (
                <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-2xl flex items-start gap-3 text-sm">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">Limited Question Set</p>
                    <p>
                      Only {partialInfo.served} of {partialInfo.requested}{" "}
                      requested questions are currently available. Your score
                      will be based on the {partialInfo.served} served
                      questions.
                    </p>
                  </div>
                </div>
              )}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-white/50 shadow-lg mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-relaxed">
                  {current.prompt}
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  {current.type === "multi"
                    ? "Select multiple options"
                    : "Select one option"}
                </p>
                <div className="space-y-3">
                  {current.choices.map((choice, choiceIndex) => {
                    const picked = (answers[current.id] || []).includes(
                      choice.id
                    );
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
                    disabled={!answeredCurrent || submittingAttempt}
                    className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer`}
                  >
                    <Send className="w-4 h-4" />
                    {submittingAttempt ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Submitting...
                      </span>
                    ) : (
                      "Submit Quiz"
                    )}
                  </button>
                )}
              </div>
            </>
          ) : null}
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
                  handleSubmit();
                }}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors hover:cursor-pointer"
              >
                {submittingAttempt ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </span>
                ) : (
                  "Submit Quiz"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
