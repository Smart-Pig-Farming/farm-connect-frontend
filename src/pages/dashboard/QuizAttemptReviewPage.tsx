import { useParams, useNavigate } from "react-router-dom";
import { useGetAttemptReviewQuery } from "@/store/api/quizApi";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Info } from "lucide-react";
import { BEST_PRACTICE_CATEGORIES } from "@/components/bestPractices/constants";

// Local color helper duplicated (consider factoring out later)
const getCategoryColors = (color?: string) => {
  const map: Record<string, { primary: string; accent: string; light: string }> = {
    green: { primary: "from-green-500 to-emerald-600", accent: "green-500", light: "green-50" },
    red: { primary: "from-red-500 to-red-600", accent: "red-500", light: "red-50" },
    teal: { primary: "from-teal-500 to-teal-600", accent: "teal-500", light: "teal-50" },
    indigo: { primary: "from-indigo-500 to-indigo-600", accent: "indigo-500", light: "indigo-50" },
    purple: { primary: "from-purple-500 to-fuchsia-600", accent: "purple-500", light: "purple-50" },
    pink: { primary: "from-pink-500 to-rose-500", accent: "pink-500", light: "pink-50" },
    blue: { primary: "from-blue-500 to-blue-600", accent: "blue-500", light: "blue-50" },
    amber: { primary: "from-amber-500 to-amber-600", accent: "amber-500", light: "amber-50" },
  };
  return map[color || "amber"]; 
};

export function QuizAttemptReviewPage() {
  const { categoryKey, quizId: quizIdParam, attemptId: attemptIdParam } = useParams();
  const quizId = Number(quizIdParam);
  const attemptId = Number(attemptIdParam);
  const navigate = useNavigate();
  const category = BEST_PRACTICE_CATEGORIES.find(c => c.key === categoryKey);
  const colors = getCategoryColors(category?.color);

  const { data: reviewData, isLoading: loadingAttempt, isError: attemptError, refetch } = useGetAttemptReviewQuery(
    { quizId, attemptId },
    { skip: !quizId || !attemptId }
  );

  const breakdown = reviewData?.breakdown || [];
  const totalQuestions = reviewData?.attempt?.total_questions || breakdown.length;
  const scorePercent = reviewData?.attempt?.score_percent;
  const scoreRaw = reviewData?.attempt?.score_raw;
  const passed = reviewData?.attempt?.passed;

  // Debug logging for the full breakdown structure
  console.log("Full reviewData breakdown:", reviewData?.breakdown);

  if (loadingAttempt) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30 px-4`}>
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          <p className="text-sm">Loading attempt review…</p>
        </div>
      </div>
    );
  }

  if (attemptError || !reviewData) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30 px-4`}>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Review Unavailable</h2>
          <p className="text-slate-600 text-sm mb-6">We couldn't load this quiz attempt. It may not exist or you may not have permission.</p>
          <div className="flex gap-3">
            <button onClick={() => refetch()} className={`flex-1 px-5 py-3 rounded-xl bg-gradient-to-r ${colors.primary} text-white text-sm font-semibold shadow hover:shadow-md transition-colors hover:cursor-pointer`}>Retry</button>
            <button onClick={() => navigate(-1)} className="flex-1 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors hover:cursor-pointer">Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-${colors.light}/30`}>      
      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(`/dashboard/best-practices/category/${categoryKey}/quiz`)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors hover:cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent flex-1">Quiz Review</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <div className="col-span-full md:col-span-1 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow">
            <h2 className="text-sm font-semibold text-slate-500 tracking-wide mb-4">Summary</h2>
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-4xl font-bold mb-1">{scorePercent !== undefined ? `${scorePercent}%` : "--"}</div>
                <div className="text-slate-500 text-sm">Score</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{scoreRaw !== undefined ? `${scoreRaw}/${totalQuestions}` : "--"}</div>
                <div className="text-slate-500 text-sm">Correct answers</div>
              </div>
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${passed ? `bg-${colors.light} text-${colors.accent}` : "bg-slate-100 text-slate-600"}`}>
                  {passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {passed ? "Passed" : "Not Passed"}
                </div>
              </div>
              <div>
                <button onClick={() => navigate(`/dashboard/best-practices/category/${categoryKey}/quiz/live`)} className={`w-full mt-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${colors.primary} text-white text-sm font-semibold shadow hover:shadow-md transition-all hover:scale-[1.02] hover:cursor-pointer`}>Retake Quiz</button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-6">
            {breakdown.map((b, idx) => {
              const selected = (b.selected_option_ids || []).slice().sort();
              const correctIds = (b.correct_option_ids || []).slice().sort();
              const overlap = selected.filter(id => correctIds.includes(id)).length;
              const exact = selected.length === correctIds.length && selected.every((id,i)=>id===correctIds[i]);
              const isCorrect = b.correct || exact;
              const isPartial = !isCorrect && (b.partial || overlap > 0);
              return (
                <div key={b.question_id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="text-xs font-medium tracking-wide text-slate-500 mb-1">QUESTION {idx + 1}</div>
                      <h3 className="text-lg font-semibold text-slate-900 leading-snug">{b.prompt}</h3>
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-medium ${isCorrect ? `text-${colors.accent}` : isPartial ? 'text-amber-600' : "text-red-600"}`}>
                      {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : isPartial ? <Info className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      {isCorrect ? "Correct" : isPartial ? "Partially Correct" : "Incorrect"}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {b.options?.map((opt, optIdx) => {
                      const chosen = selected.includes(opt.id);
                      const isOptCorrect = opt.is_correct;
                      let style = "bg-slate-50 border-slate-200 text-slate-700";
                      if (isOptCorrect && chosen) style = "bg-green-50 border-green-500 text-green-800";
                      else if (isOptCorrect && !chosen) style = "bg-green-50/60 border-green-300 text-green-700";
                      else if (!isOptCorrect && chosen) style = "bg-red-50 border-red-300 text-red-700";
                      return (
                        <div key={opt.id} className={`rounded-xl border px-4 py-2 flex items-start gap-3 ${style}`}>
                          <div className="pt-0.5 text-xs font-mono text-slate-400">{String.fromCharCode(65 + (optIdx || 0))}</div>
                          <div className="flex-1 text-sm font-medium leading-snug">{opt.text}</div>
                          {isOptCorrect && chosen && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                          {isOptCorrect && !chosen && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 opacity-70" />}
                          {!isOptCorrect && chosen && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                          {isOptCorrect && !chosen && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-green-600 bg-white/70 border border-green-200 px-1.5 py-0.5 rounded">Answer</span>}
                          {!isOptCorrect && chosen && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-red-600 bg-white/70 border border-red-200 px-1.5 py-0.5 rounded">Your Choice</span>}
                        </div>
                      );
                    })}
                  </div>

                  {b.explanation && (
                    <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600 flex gap-3">
                      <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-700 mb-1">Explanation</div>
                        <p className="leading-relaxed whitespace-pre-wrap">{b.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizAttemptReviewPage;
