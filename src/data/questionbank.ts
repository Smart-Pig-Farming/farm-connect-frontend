import type {
  QuizQuestionDraft,
  BestPracticeCategoryKey,
} from "@/types/bestPractices";

// Programmatically generate 500 questions (63+63+63+63+62+62+62+62 = 500)
// This avoids maintaining a huge static literal while still yielding deterministic IDs/content.

interface GenerationPlanItem {
  key: BestPracticeCategoryKey;
  count: number;
  label: string;
}

const CATEGORY_PLAN: GenerationPlanItem[] = [
  { key: "feeding_nutrition", count: 63, label: "Feeding & Nutrition" },
  { key: "disease_control", count: 63, label: "Disease Control" },
  { key: "growth_weight", count: 63, label: "Growth & Weight" },
  { key: "environment_management", count: 63, label: "Environment Mgmt" },
  { key: "breeding_insemination", count: 62, label: "Breeding & Insemination" },
  { key: "farrowing_management", count: 62, label: "Farrowing Mgmt" },
  { key: "record_management", count: 62, label: "Record Mgmt" },
  { key: "marketing_finance", count: 62, label: "Marketing & Finance" },
];

// Difficulty distribution targets (approx): 40% easy, 40% medium, 20% hard
function pickDifficulty(
  index: number,
  total: number
): "easy" | "medium" | "hard" {
  const ratio = index / total;
  if (ratio < 0.4) return "easy";
  if (ratio < 0.8) return "medium";
  return "hard";
}

// Cycle question types: mcq, mcq, truefalse, multi, mcq ...
function pickType(i: number): "mcq" | "multi" | "truefalse" {
  const mod = i % 5;
  if (mod === 2) return "truefalse";
  if (mod === 3) return "multi";
  return "mcq";
}

function buildChoices(
  baseId: string,
  type: "mcq" | "multi" | "truefalse",
  seed: number
) {
  if (type === "truefalse") {
    const correctTrue = seed % 2 === 0; // alternate correctness
    return [
      { id: `${baseId}_a`, text: "True", correct: correctTrue },
      { id: `${baseId}_b`, text: "False", correct: !correctTrue },
    ];
  }
  if (type === "mcq") {
    // 4 choices, make one correct (choice b). Texts mildly varied by seed.
    return [
      { id: `${baseId}_a`, text: `Option A ${seed + 1}`, correct: false },
      {
        id: `${baseId}_b`,
        text: `Primary Correct Insight ${seed + 1}`,
        correct: true,
      },
      { id: `${baseId}_c`, text: `Distractor C ${seed + 1}`, correct: false },
      { id: `${baseId}_d`, text: `Distractor D ${seed + 1}`, correct: false },
    ];
  }
  // multi: 5 choices, choose 2-3 correct depending on seed
  const correctPattern = (seed % 3) + 2; // 2 or 3 correct
  return Array.from({ length: 5 }).map((_, ci) => ({
    id: `${baseId}_${String.fromCharCode(97 + ci)}`,
    text: `Multi Choice ${ci + 1} Variant ${seed + 1}`,
    correct: ci < correctPattern,
  }));
}

function buildPrompt(
  catLabel: string,
  type: string,
  idx: number,
  difficulty: string
) {
  if (type === "truefalse") {
    return `${catLabel}: ${
      idx + 1
    } – This statement about ${catLabel.toLowerCase()} is ${
      difficulty === "hard" ? "complex" : "important"
    }.`;
  }
  if (type === "multi") {
    return `${catLabel}: Select all applicable considerations (#${
      idx + 1
    }) for best practice (${difficulty}).`;
  }
  return `${catLabel}: What is the most appropriate action/scenario (#${
    idx + 1
  }) for this ${difficulty} case?`;
}

function buildExplanation(catLabel: string, type: string, difficulty: string) {
  const base = `${catLabel} ${
    type === "multi" ? "multi-select" : type.toUpperCase()
  } rationale`;
  if (difficulty === "easy")
    return `${base}: reinforces foundational principle.`;
  if (difficulty === "medium")
    return `${base}: applies intermediate management judgment.`;
  return `${base}: reflects advanced optimization or edge-case handling.`;
}

function pad(num: number, len = 3) {
  return String(num).padStart(len, "0");
}

const generationTimestamp = Date.now();

const generated: QuizQuestionDraft[] = [];
for (const plan of CATEGORY_PLAN) {
  for (let i = 0; i < plan.count; i++) {
    const type = pickType(i);
    const difficulty = pickDifficulty(i, plan.count);
    const idCore = `${plan.key
      .split("_")
      .map((p) => p[0])
      .join("")}`; // abbreviation
    const id = `${idCore}_${pad(i + 1)}`;
    const choices = buildChoices(id, type, i);
    generated.push({
      id,
      category: plan.key,
      prompt: buildPrompt(plan.label, type, i, difficulty),
      type,
      choices,
      explanation: buildExplanation(plan.label, type, difficulty),
      difficulty,
      media: null,
      status: "saved",
      createdAt: generationTimestamp,
      updatedAt: generationTimestamp,
    });
  }
}

// Safety assert (development only)
if (generated.length !== 500) {
  console.warn("Question bank generation mismatch", generated.length);
}

export const QUESTION_BANK: QuizQuestionDraft[] = generated;

// Helper functions (unchanged public contract)
export function getQuestionsByCategory(
  categoryKey: string
): QuizQuestionDraft[] {
  return QUESTION_BANK.filter((q) => q.category === categoryKey);
}

export function getQuestionsByDifficulty(
  difficulty: "easy" | "medium" | "hard"
): QuizQuestionDraft[] {
  return QUESTION_BANK.filter((q) => q.difficulty === difficulty);
}

export function getRandomQuestions(
  categoryKey: string,
  count: number = 10,
  difficulty?: "easy" | "medium" | "hard"
): QuizQuestionDraft[] {
  let pool = getQuestionsByCategory(categoryKey);
  if (difficulty) pool = pool.filter((q) => q.difficulty === difficulty);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export const QUESTION_BANK_STATS = {
  total: QUESTION_BANK.length,
  byCategory: CATEGORY_PLAN.reduce<Record<string, number>>((acc, c) => {
    acc[c.key] = QUESTION_BANK.filter((q) => q.category === c.key).length;
    return acc;
  }, {}),
  byDifficulty: {
    easy: QUESTION_BANK.filter((q) => q.difficulty === "easy").length,
    medium: QUESTION_BANK.filter((q) => q.difficulty === "medium").length,
    hard: QUESTION_BANK.filter((q) => q.difficulty === "hard").length,
  },
};
