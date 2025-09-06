import type {
  BestPracticeContentDraft,
  BestPracticeCategoryKey,
} from "@/types/bestPractices";

// Utility to create steps quickly
import { uuidv4 } from "@/utils/uuid";
function steps(texts: string[]) {
  return texts.map((t, i) => ({
    id: `${uuidv4()}`,
    text: t,
    order: i,
  }));
}

function nowMinus(days: number) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

// Re-usable benefits fragments
const benefitSets = [
  ["Improves herd health", "Reduces operational cost", "Enhances productivity"],
  ["Saves time", "Improves accuracy", "Scales with farm size"],
  ["Early issue detection", "Better decision making"],
];

const categoryPool: BestPracticeCategoryKey[] = [
  "feeding_nutrition",
  "disease_control",
  "growth_weight",
  "environment_management",
  "breeding_insemination",
  "farrowing_management",
  "record_management",
  "marketing_finance",
];

// Public media references (image/video) - using existing assets under public/images
const imagePaths = [
  "/images/post_image.jpg",
  "/images/post_image2.jpg",
  "/images/post_image3.jpg",
  "/images/post_image4.jpg",
  "/images/hero.png",
];
const videoPaths = ["/images/post_video.mp4"];

function media(i: number) {
  // Alternate between image and occasional video
  if (i % 7 === 0) {
    return {
      kind: "video" as const,
      previewUrl: videoPaths[0],
      alt: "Demonstration video",
    };
  }
  const img = imagePaths[i % imagePaths.length];
  return {
    kind: "image" as const,
    previewUrl: img,
    alt: "Illustrative farm practice",
  };
}

function makeDraft(i: number): BestPracticeContentDraft {
  const title = `Optimizing Feed Cycle Strategy ${i + 1}`;
  const description =
    "Detailed guidance on structuring feed schedules, ration balancing, and monitoring consumption trends to maximize growth performance while minimizing waste.";

  // Ensure at least one primary category based on index
  const primary = categoryPool[i % categoryPool.length];
  const extra: BestPracticeCategoryKey[] = [];
  // 1 in 3 items get a second category
  if (i % 3 === 0) {
    const second = categoryPool[(i + 3) % categoryPool.length];
    if (second !== primary) extra.push(second);
  }
  // 1 in 6 items get a third category
  if (i % 6 === 0) {
    const third = categoryPool[(i + 5) % categoryPool.length];
    if (third !== primary && !extra.includes(third)) extra.push(third);
  }
  const categories = [primary, ...extra];

  return {
    id: uuidv4(),
    title,
    description,
    steps: steps([
      "Assess current feed conversion ratios and historical growth records.",
      "Segment animals by weight class and nutritional requirement.",
      "Formulate balanced rations using locally available ingredients.",
      "Implement scheduled feeding windows and monitor intake.",
      "Track performance metrics weekly and adjust ration composition.",
    ]),
    benefits: benefitSets[i % benefitSets.length],
    categories,
    media: media(i),
    status: "saved",
    createdAt: nowMinus(i + 1),
    updatedAt: nowMinus(i),
  };
}

export const BEST_PRACTICES_MOCK: BestPracticeContentDraft[] = Array.from(
  { length: 120 },
  (_, i) => makeDraft(i)
);

// Shared page size constant (can be imported elsewhere)
export const BEST_PRACTICES_PAGE_SIZE = 5;

// Helper to simulate server-side paginated fetch
export function fetchPracticesPage(
  page: number,
  pageSize: number,
  category?: BestPracticeCategoryKey
) {
  const start = page * pageSize;
  const end = start + pageSize;
  const filtered = category
    ? BEST_PRACTICES_MOCK.filter((p) => p.categories.includes(category))
    : BEST_PRACTICES_MOCK;
  const slice = filtered.slice(start, end);
  const hasMore = end < filtered.length;
  // Simulate network latency
  return new Promise<{ data: BestPracticeContentDraft[]; hasMore: boolean }>(
    (resolve) => {
      setTimeout(
        () => resolve({ data: slice, hasMore }),
        400 + Math.random() * 300
      );
    }
  );
}

// Fetch a single practice by id (simulated async with small latency)
export function fetchPracticeById(id: string) {
  return new Promise<BestPracticeContentDraft | null>((resolve) => {
    setTimeout(() => {
      resolve(BEST_PRACTICES_MOCK.find((p) => p.id === id) || null);
    }, 250 + Math.random() * 250);
  });
}
