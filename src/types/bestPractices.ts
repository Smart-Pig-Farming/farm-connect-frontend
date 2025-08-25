// Interface-only types for the Best Practices feature
export type BestPracticeCategoryKey =
  | "feeding_nutrition"
  | "disease_control"
  | "growth_weight"
  | "environment_management"
  | "breeding_insemination"
  | "farrowing_management"
  | "record_management"
  | "marketing_finance";

export interface BestPracticeCategory {
  key: BestPracticeCategoryKey;
  name: string;
  description?: string;
  color?: string; // tailwind token stem
  icon?: string; // lucide icon name
}

export interface BestPracticeStep {
  id: string;
  text: string;
  order: number;
}

export interface BestPracticeMedia {
  kind: "image" | "video";
  file?: File; // local only (not persisted)
  previewUrl?: string; // object URL for preview
  alt?: string; // alt text / caption
}

export interface BestPracticeContentDraft {
  id: string;
  title: string;
  description: string;
  steps: BestPracticeStep[];
  benefits: string[];
  categories: BestPracticeCategoryKey[];
  media?: BestPracticeMedia | null;
  status: "draft" | "saved";
  createdAt: number;
  updatedAt: number;
  stepsCount?: number; // derived from backend list
  benefitsCount?: number; // derived from backend list
}

export type QuizQuestionType = "mcq" | "multi" | "truefalse";

export interface QuizChoice {
  id: string;
  text: string;
  correct: boolean;
}

export interface QuizQuestionDraft {
  id: string;
  category: BestPracticeCategoryKey;
  prompt: string;
  type: QuizQuestionType;
  choices: QuizChoice[];
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  media?: BestPracticeMedia | null;
  status: "draft" | "saved";
  createdAt: number;
  updatedAt: number;
}
