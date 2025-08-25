import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { BestPracticeContentDraft } from "@/types/bestPractices";
import { PracticeDetails } from "@/components/bestPractices/PracticeDetails";
import { useGetBestPracticeQuery } from "@/store/api/bestPracticesApi";

// Adapt server response practice -> local draft shape
function adaptPractice(api: unknown): BestPracticeContentDraft {
  const obj = (api ?? {}) as Record<string, unknown>;
  let stepsSrc: unknown = obj.steps_json;
  if (typeof stepsSrc === "string") {
    try {
      const parsed = JSON.parse(stepsSrc);
      if (Array.isArray(parsed)) stepsSrc = parsed;
      else stepsSrc = [];
    } catch {
      stepsSrc = [];
    }
  }
  if (!Array.isArray(stepsSrc)) stepsSrc = [];
  const stepsArr = stepsSrc as unknown[];
  const steps = stepsArr.map((raw, i) => {
    if (raw && typeof raw === "object") {
      const rec = raw as Record<string, unknown>;
      const id = typeof rec.id === "string" ? rec.id : crypto.randomUUID();
      const text = typeof rec.text === "string" ? rec.text : "";
      const order = typeof rec.order === "number" ? rec.order : i;
      return { id, text, order };
    }
    return { id: crypto.randomUUID(), text: String(raw ?? ""), order: i };
  });
  let benefitsArr: unknown = obj.benefits_json;
  if (typeof benefitsArr === "string") {
    try {
      const parsed = JSON.parse(benefitsArr);
      if (Array.isArray(parsed)) benefitsArr = parsed;
      else benefitsArr = [];
    } catch {
      benefitsArr = [];
    }
  }
  const benefits = Array.isArray(benefitsArr)
    ? (benefitsArr as unknown[]).map((b) => String(b))
    : [];
  return {
    id: String(obj.id ?? ""),
    title: (obj.title as string) || "",
    description: (obj.description as string) || "",
    steps,
    benefits,
    categories: Array.isArray(obj.categories)
      ? (obj.categories as string[]).filter(
          (c): c is import("@/types/bestPractices").BestPracticeCategoryKey =>
            [
              "feeding_nutrition",
              "disease_control",
              "growth_weight",
              "environment_management",
              "breeding_insemination",
              "farrowing_management",
              "record_management",
              "marketing_finance",
            ].includes(c)
        )
      : [],
    media: (() => {
      const mediaRaw = (obj as Record<string, unknown>).media as
        | Record<string, unknown>
        | undefined;
      if (!mediaRaw) return null;
      const kind = typeof mediaRaw.kind === "string" ? mediaRaw.kind : "image";
      const url = typeof mediaRaw.url === "string" ? mediaRaw.url : undefined;
      const thumb =
        typeof mediaRaw.thumbnail_url === "string"
          ? mediaRaw.thumbnail_url
          : undefined;
      const originalName =
        typeof mediaRaw.originalName === "string"
          ? mediaRaw.originalName
          : undefined;
      return {
        kind: kind as "image" | "video",
        previewUrl: url || thumb,
        alt: originalName || (obj.title as string) || "",
      };
    })(),
    status: "saved",
    createdAt: obj.created_at ? Date.parse(String(obj.created_at)) : Date.now(),
    updatedAt: obj.updated_at ? Date.parse(String(obj.updated_at)) : Date.now(),
    stepsCount: steps.length,
    benefitsCount: benefits.length,
  };
}

export function PracticeDetailsPage() {
  const { practiceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { practice?: BestPracticeContentDraft };
  };
  const optimistic: BestPracticeContentDraft | undefined =
    location.state?.practice;
  const [practice, setPractice] = useState<BestPracticeContentDraft | null>(
    optimistic || null
  );

  const numericId = practiceId ? Number(practiceId) : undefined;
  const { data, isFetching, isError, error } = useGetBestPracticeQuery(
    numericId!,
    {
      skip: !numericId,
    }
  );

  // When API data arrives, adapt & store
  useEffect(() => {
    if (data?.practice) {
      setPractice(adaptPractice(data.practice));
    }
  }, [data]);

  // Navigation from API navigation object
  const nav = data?.navigation;
  const hasPrev = !!nav?.prevId;
  const hasNext = !!nav?.nextId;
  const goPrev = () => {
    if (nav?.prevId) navigate(`/dashboard/best-practices/${nav.prevId}`);
  };
  const goNext = () => {
    if (nav?.nextId) navigate(`/dashboard/best-practices/${nav.nextId}`);
  };

  const loading = isFetching && !practice; // show skeleton only if nothing yet
  const resolvedError: string | null =
    isError && !practice
      ? (error as unknown as { data?: { error?: string } })?.data?.error ||
        "Failed to load practice"
      : null;

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

        {resolvedError && !loading && (
          <div className="p-10 border border-red-300 dark:border-red-700 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            <p className="font-medium mb-4">{resolvedError}</p>
            <button
              onClick={() => navigate("/dashboard/best-practices")}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Return to Best Practices
            </button>
          </div>
        )}

        {!loading && !resolvedError && practice && (
          <PracticeDetails
            practice={practice}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={goPrev}
            onNext={goNext}
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
