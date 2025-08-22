import type {
  QuizQuestionDraft,
  BestPracticeCategoryKey,
} from "@/types/bestPractices";
import { QUESTION_BANK } from "@/data/questionbank";

const STORAGE_KEY = "quiz.questions";

/**
 * Load all questions from localStorage and ensure synchronization with the
 * current static QUESTION_BANK. Any questions present in the static bank but
 * missing from storage are appended (without overwriting user edits to
 * existing IDs). This guarantees the Question Bank page reflects the full
 * mock dataset after the static bank was expanded.
 */
function loadAll(): QuizQuestionDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First-time or cleared storage: seed entire static bank
      if (QUESTION_BANK.length) {
        saveAll(QUESTION_BANK);
        return QUESTION_BANK.slice();
      }
      return [];
    }
  const parsed = JSON.parse(raw) as QuizQuestionDraft[];

    // If parsed empty, force seed
    if (!parsed.length && QUESTION_BANK.length) {
      saveAll(QUESTION_BANK);
      return QUESTION_BANK.slice();
    }

    // Merge in any missing static questions
    const existingIds = new Set(parsed.map((q) => q.id));
  const merged = parsed.slice();
    let appended = 0;
    for (const staticQ of QUESTION_BANK) {
      if (!existingIds.has(staticQ.id)) {
        merged.push(staticQ);
        appended++;
      }
    }
    if (appended > 0) {
      saveAll(merged);
      return merged;
    }
    return parsed;
  } catch {
    // Fallback directly to static bank on error
    return QUESTION_BANK.slice();
  }
}

function saveAll(qs: QuizQuestionDraft[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(qs));
  } catch {
    // ignore
  }
}

export function getQuestionsByCategory(cat: BestPracticeCategoryKey) {
  return loadAll().filter((q) => q.category === cat);
}

export function upsertQuestion(q: QuizQuestionDraft) {
  const all = loadAll();
  const idx = all.findIndex((x) => x.id === q.id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...q, updatedAt: Date.now() };
  } else {
    all.push({ ...q, createdAt: Date.now(), updatedAt: Date.now() });
  }
  saveAll(all);
  return q;
}

export function deleteQuestion(id: string) {
  const all = loadAll().filter((q) => q.id !== id);
  saveAll(all);
}

// Simple random set for quiz attempt (max 10)
export function getQuizSet(cat: BestPracticeCategoryKey, limit = 10) {
  const qs = getQuestionsByCategory(cat).slice();
  // Fisher-Yates shuffle
  for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [qs[i], qs[j]] = [qs[j], qs[i]];
  }
  return qs.slice(0, limit);
}

// Utility: get a mixed difficulty set (attempt balanced selection if available)
export function getBalancedQuizSet(cat: BestPracticeCategoryKey, limit = 10) {
  const pool = getQuestionsByCategory(cat);
  if (pool.length <= limit) return pool.slice();

  const easy = pool.filter((q) => q.difficulty === "easy");
  const med = pool.filter((q) => q.difficulty === "medium");
  const hard = pool.filter((q) => q.difficulty === "hard");

  const targetEasy = Math.max(2, Math.round(limit * 0.4));
  const targetMed = Math.max(2, Math.round(limit * 0.4));
  const targetHard = Math.max(1, limit - targetEasy - targetMed);

  function pick(arr: QuizQuestionDraft[], n: number) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(n, copy.length));
  }

  const selection = [
    ...pick(easy, targetEasy),
    ...pick(med, targetMed),
    ...pick(hard, targetHard),
  ];

  // If still short (due to lack in a difficulty), fill randomly from remaining
  if (selection.length < limit) {
    const remaining = pool.filter((q) => !selection.includes(q));
    selection.push(...pick(remaining, limit - selection.length));
  }

  // Final shuffle
  for (let i = selection.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selection[i], selection[j]] = [selection[j], selection[i]];
  }
  return selection.slice(0, limit);
}
