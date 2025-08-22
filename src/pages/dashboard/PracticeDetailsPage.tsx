import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { BestPracticeContentDraft } from "@/types/bestPractices";
import {
  fetchPracticeById,
  BEST_PRACTICES_MOCK,
} from "@/data/bestPracticesMock";
import { PracticeDetails } from "@/components/bestPractices/PracticeDetails";

export function PracticeDetailsPage() {
  const { practiceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { practice?: BestPracticeContentDraft };
  };
  const passed: BestPracticeContentDraft | undefined = location.state?.practice;
  const [practice, setPractice] = useState<BestPracticeContentDraft | null>(
    passed || null
  );
  const [loading, setLoading] = useState(!passed);
  const [error, setError] = useState<string | null>(null);
  const [siblings, setSiblings] = useState<BestPracticeContentDraft[]>([]);

  // Build sibling list (same first category) once practice loaded
  useEffect(() => {
    if (!practice) return;
    const primary = practice.categories[0];
    const list = BEST_PRACTICES_MOCK.filter((p) => p.categories[0] === primary);
    setSiblings(list);
  }, [practice]);

  const currentIndex = practice
    ? siblings.findIndex((p) => p.id === practice.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < siblings.length - 1;

  const goSibling = (offset: number) => {
    if (currentIndex < 0) return;
    const target = siblings[currentIndex + offset];
    if (!target) return;
    // Navigate replacing URL param but keep no state reliance
    navigate(`/dashboard/best-practices/${target.id}`, {
      state: { practice: target },
    });
    setPractice(target); // optimistic update
  };

  useEffect(() => {
    if (practice || !practiceId) return;
    setLoading(true);
    fetchPracticeById(practiceId)
      .then((p) => {
        if (!p) {
          setError("Practice not found");
        }
        setPractice(p);
      })
      .catch((e) => setError(e?.message || "Failed to load practice"))
      .finally(() => setLoading(false));
  }, [practiceId, practice]);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <button
          onClick={() => {
            if (practice?.categories?.[0]) {
              navigate(
                `/dashboard/best-practices/category/${practice.categories[0]}`
              );
            } else {
              navigate("/dashboard/best-practices");
            }
          }}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-6 group hover:cursor-pointer"
        >
          <svg
            className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
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
          Back
        </button>

        {loading && (
          <div className="space-y-6">
            <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-64 w-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                  />
                ))}
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="p-10 border border-red-300 dark:border-red-700 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            <p className="font-medium mb-4">{error}</p>
            <button
              onClick={() => navigate("/dashboard/best-practices")}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Return to Best Practices
            </button>
          </div>
        )}

        {!loading && !error && practice && (
          <PracticeDetails
            practice={practice}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={() => goSibling(-1)}
            onNext={() => goSibling(1)}
            onClose={() => {
              if (practice.categories?.[0]) {
                navigate(
                  `/dashboard/best-practices/category/${practice.categories[0]}`
                );
              } else {
                navigate("/dashboard/best-practices");
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
