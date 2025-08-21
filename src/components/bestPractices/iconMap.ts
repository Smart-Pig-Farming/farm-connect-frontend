import type { BestPracticeCategoryKey } from "@/types/bestPractices";
import {
  UtensilsCrossed,
  ShieldCheck,
  Activity,
  Leaf,
  Dna,
  HeartPulse,
  ClipboardList,
  LineChart,
  Folder,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const categoryIconMap: Record<BestPracticeCategoryKey, LucideIcon> = {
  feeding_nutrition: UtensilsCrossed,
  disease_control: ShieldCheck,
  growth_weight: Activity,
  environment_management: Leaf,
  breeding_insemination: Dna,
  farrowing_management: HeartPulse,
  record_management: ClipboardList,
  marketing_finance: LineChart,
};

export function getCategoryIcon(key: BestPracticeCategoryKey): LucideIcon {
  return categoryIconMap[key] || Folder;
}
