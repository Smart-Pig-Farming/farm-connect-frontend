import type { BestPracticeCategory } from "@/types/bestPractices";

export const BEST_PRACTICE_CATEGORIES: BestPracticeCategory[] = [
  {
    key: "feeding_nutrition",
    name: "Feeding & Nutrition",
    // Green for growth/health
    color: "green",
    icon: "UtensilsCrossed",
  },
  {
    key: "disease_control",
    name: "Disease Control",
    color: "red",
    icon: "ShieldCheck",
  },
  {
    key: "growth_weight",
    name: "Growth & Weight Mgmt",
    // Teal to represent balanced progress
    color: "teal",
    icon: "Activity",
  },
  {
    key: "environment_management",
    name: "Environment Mgmt",
    // Teal already used; use indigo for systems/environment or could be 'emerald'
    color: "indigo",
    icon: "Leaf",
  },
  {
    key: "breeding_insemination",
    name: "Breeding & Insemination",
    // Purple hues for genetics/reproduction
    color: "purple",
    icon: "Dna",
  },
  {
    key: "farrowing_management",
    name: "Farrowing Mgmt",
    color: "pink",
    icon: "HeartPulse",
  },
  {
    key: "record_management",
    name: "Record & Farm Mgmt",
    color: "blue",
    icon: "ClipboardList",
  },
  {
    key: "marketing_finance",
    name: "Marketing & Finance",
    // Amber conveys value/wealth (could also be gold-like)
    color: "amber",
    icon: "LineChart",
  },
];
