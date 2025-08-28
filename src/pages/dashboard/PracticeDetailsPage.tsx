import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { BestPracticeContentDraft } from "@/types/bestPractices";
import { PracticeDetails } from "@/components/bestPractices/PracticeDetails";
import {
  useGetBestPracticeQuery,
  type DetailContextFilters,
} from "@/store/api/bestPracticesApi";
import { useSelector } from "react-redux";
import { useWebSocket } from "@/hooks/useWebSocket";
import { processScoreEvents } from "@/store/utils/scoreEventsClient";
import { useAppDispatch } from "@/store/hooks";
import type { RootState } from "@/store";

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
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: {
      practice?: BestPracticeContentDraft;
      ctx?: DetailContextFilters;
      originCategory?: string;
    };
  };
  const optimistic: BestPracticeContentDraft | undefined =
    location.state?.practice;
  const [practice, setPractice] = useState<BestPracticeContentDraft | null>(
    optimistic || null
  );
  const dispatch = useAppDispatch();
  const authUserId = useSelector((s: RootState) => s.auth.user?.id);

  const numericId = practiceId ? Number(practiceId) : undefined;

  // Derive context filters (priority: location.state.ctx -> query params -> practice categories (category))
  const locationSearch =
    (location as unknown as { search?: string }).search ||
    window.location.search ||
    "";
  const derivedCtx: DetailContextFilters | undefined = useMemo(() => {
    const fromState = location.state?.ctx;
    if (fromState) return fromState;
    const searchParams = new URLSearchParams(locationSearch);
    const p: DetailContextFilters = {};
    const cat = searchParams.get("category");
    if (cat) p.category = cat;
    const search = searchParams.get("search");
    if (search) p.search = search;
    const createdBy = searchParams.get("created_by");
    if (createdBy && !isNaN(Number(createdBy)))
      p.created_by = Number(createdBy);
    const published = searchParams.get("published");
    if (published) p.published = published === "true";
    return Object.keys(p).length ? p : undefined;
  }, [location.state, locationSearch]);

  const { data, isFetching, isError, error } = useGetBestPracticeQuery(
    numericId
      ? { id: numericId, ctx: derivedCtx }
      : (0 as unknown as { id: number }),
    { skip: !numericId }
  );

  // Access cached list (any variant) for client-side prev/next when available
  // We look for list caches in RTK Query state keyed by endpoint 'listBestPractices'
  interface ListCacheData {
    items: Array<{ id: number; created_at: string }>;
  }
  interface QueryCacheEntry {
    data?: ListCacheData;
  }
  interface ApiSliceState {
    queries?: Record<string, QueryCacheEntry>;
  }
  const listCacheEntries = useSelector((state: RootState) => {
    const apiSlice = (state as unknown as { api?: ApiSliceState }).api;
    if (!apiSlice?.queries) return [] as ListCacheData[];
    const out: ListCacheData[] = [];
    for (const [key, entry] of Object.entries(apiSlice.queries)) {
      if (key.startsWith("listBestPractices") && entry.data?.items)
        out.push(entry.data);
    }
    return out;
  });

  const clientNav = useMemo(() => {
    if (!numericId || !listCacheEntries.length)
      return { prevId: null, nextId: null };
    // Merge all cached pages preserving order as in newest -> oldest
    const merged: Array<{ id: number; created_at: string }> = [];
    const seen = new Set<number>();
    for (const entry of listCacheEntries) {
      for (const it of entry.items) {
        if (!seen.has(it.id)) {
          merged.push(it);
          seen.add(it.id);
        }
      }
    }
    // Sort to ensure correct order: created_at DESC then id DESC
    merged.sort((a, b) => {
      const ta = Date.parse(a.created_at);
      const tb = Date.parse(b.created_at);
      if (tb !== ta) return tb - ta;
      return b.id - a.id;
    });
    const idx = merged.findIndex((m) => m.id === numericId);
    if (idx === -1) return { prevId: null, nextId: null };
    const prev = idx > 0 ? merged[idx - 1].id : null; // newer
    const next = idx < merged.length - 1 ? merged[idx + 1].id : null; // older
    return { prevId: prev, nextId: next };
  }, [numericId, listCacheEntries]);

  // When API data arrives, adapt & store
  useEffect(() => {
    if (data?.practice) {
      setPractice(adaptPractice(data.practice));
    }
  }, [data]);

  // Subscribe to score events to catch BEST_PRACTICE_FIRST_READ awarded elsewhere (another tab/device)
  useWebSocket(
    {
      onScoreEvents: ({ events }) => {
        if (!events?.length) return;
        const bpEvents = events.filter(
          (e) => e.type === "BEST_PRACTICE_FIRST_READ"
        );
        if (bpEvents.length) {
          // @ts-expect-error ScoreEventWs shape matches expected input
          processScoreEvents(bpEvents, {
            dispatch,
            currentUserId: authUserId,
            applyDaily: true,
          });
          // WebSocket events update the score but don't trigger flash
          // We rely only on API response for flash to prevent duplicates
          // This keeps other tabs/devices in sync without double-flashing
        }
      },
    },
    { autoConnect: true }
  );

  // Navigation from API navigation object
  // Combine clientNav with server nav (client takes precedence if exists)
  const nav = data?.navigation;
  const effectivePrevId = clientNav.prevId ?? nav?.prevId ?? null;
  const effectiveNextId = clientNav.nextId ?? nav?.nextId ?? null;
  const hasPrev = !!effectivePrevId;
  const hasNext = !!effectiveNextId;
  const goPrev = () => {
    if (effectivePrevId)
      navigate(`/dashboard/best-practices/${effectivePrevId}`, {
        state: { ctx: derivedCtx },
      });
  };
  const goNext = () => {
    if (effectiveNextId)
      navigate(`/dashboard/best-practices/${effectiveNextId}`, {
        state: { ctx: derivedCtx },
      });
  };

  const loading = isFetching && !practice; // show skeleton only if nothing yet
  const resolvedError: string | null =
    isError && !practice
      ? (error as unknown as { data?: { error?: string } })?.data?.error ||
        "Failed to load practice"
      : null;

  // Centralized navigation logic for both back button and close button
  const handleBackNavigation = useCallback(() => {
    const originCategory = location.state?.originCategory;
    if (originCategory) {
      navigate(`/dashboard/best-practices/category/${originCategory}`);
      return;
    }
    if (derivedCtx?.category) {
      navigate(`/dashboard/best-practices/category/${derivedCtx.category}`);
      return;
    }
    if (practice?.categories?.length) {
      // Prefer whichever category matches derivedCtx or fallback to first
      const match =
        derivedCtx?.category &&
        (practice.categories as string[]).includes(derivedCtx.category)
          ? derivedCtx.category
          : practice.categories[0];
      if (match) {
        navigate(`/dashboard/best-practices/category/${match}`);
        return;
      }
    }
    navigate("/dashboard/best-practices");
  }, [
    location.state?.originCategory,
    derivedCtx?.category,
    practice?.categories,
    navigate,
  ]);

  // Points flash (first read award) - Only show for truly first reads
  const [flashDelta, setFlashDelta] = useState<number | null>(null);
  const [hasShownFlashForCurrentPractice, setHasShownFlashForCurrentPractice] =
    useState<boolean>(false);

  // Reset flash state when practice changes
  useEffect(() => {
    setFlashDelta(null);
    setHasShownFlashForCurrentPractice(false);
  }, [practiceId]);

  // Centralized flash trigger function - only trigger if not already shown for this practice
  const triggerFlash = useCallback(
    (delta: number) => {
      if (hasShownFlashForCurrentPractice || flashDelta) {
        return;
      }

      setHasShownFlashForCurrentPractice(true);
      setFlashDelta(delta);
      setTimeout(() => {
        setFlashDelta(null);
      }, 2000);
    },
    [hasShownFlashForCurrentPractice, flashDelta]
  );

  // API-based flash trigger - ONLY for first reads
  useEffect(() => {
    console.log("[PracticeDetailsPage] Flash check:", {
      awarded_first_read: data?.scoring?.awarded_first_read,
      points_delta: data?.scoring?.points_delta,
      hasShownFlash: hasShownFlashForCurrentPractice,
      practiceId,
    });

    // Only flash if this is truly a first read award (backend confirms it)
    if (
      data?.scoring?.awarded_first_read === true &&
      data?.scoring?.points_delta
    ) {
      console.log("[PracticeDetailsPage] Triggering flash for first read");
      triggerFlash(data.scoring.points_delta);
    }
  }, [
    data?.scoring?.awarded_first_read,
    data?.scoring?.points_delta,
    triggerFlash,
    hasShownFlashForCurrentPractice,
    practiceId,
  ]);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {flashDelta && (
          <div
            key={`flash-${Date.now()}`} // Force new animation on each flash
            className="fixed top-4 right-4 z-50 select-none animate-[fadeSlideIn_2s_ease-out] pointer-events-none"
            style={{
              animationFillMode: "forwards",
              animationIterationCount: "1", // Ensure animation only runs once
            }}
          >
            <div className="px-4 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold shadow-xl ring-2 ring-emerald-400/40 flex items-center gap-2.5">
              <div className="flex items-center justify-center w-4 h-4">
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping" />
              </div>
              <span>
                +{flashDelta} point{flashDelta === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleBackNavigation}
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
            onClose={handleBackNavigation}
          />
        )}
      </div>
    </div>
  );
}
