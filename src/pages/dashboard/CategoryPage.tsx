import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CategoryView } from "@/components/bestPractices/CategoryView";
import { BEST_PRACTICE_CATEGORIES } from "@/components/bestPractices/constants";
import type {
  BestPracticeCategory,
  BestPracticeContentDraft,
  QuizQuestionDraft,
} from "@/types/bestPractices";
import {
  fetchPracticesPage,
  BEST_PRACTICES_PAGE_SIZE,
} from "@/data/bestPracticesMock";

// Dedicated category route page: /dashboard/best-practices/category/:categoryKey
export function CategoryPage() {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode") === "quiz" ? "quiz" : "learn";
  const [mode] = useState<"learn" | "quiz">(modeParam);
  const [contents, setContents] = useState<BestPracticeContentDraft[]>([]);
  const [questions] = useState<QuizQuestionDraft[]>([]); // placeholder for future quiz data source

  const category: BestPracticeCategory | undefined =
    BEST_PRACTICE_CATEGORIES.find((c) => c.key === categoryKey);

  useEffect(() => {
    if (modeParam === "quiz" && categoryKey) {
      navigate(`/dashboard/best-practices/category/${categoryKey}/quiz`, { replace: true });
      return;
    }
    if (!category) return;
    if (contents.length === 0) {
      fetchPracticesPage(0, BEST_PRACTICES_PAGE_SIZE, category.key).then((r) =>
        setContents(r.data)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey]);

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-slate-600 mb-6">Category not found.</p>
        <button
          onClick={() => navigate("/dashboard/best-practices")}
          className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
        >
          Back to Best Practices
        </button>
      </div>
    );
  }

  const filteredContents = contents.filter((c) =>
    c.categories.includes(category.key)
  );
  const filteredQuestions = questions.filter(
    (q) => q.category === category.key
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-900 dark:to-slate-800">
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <CategoryView
            category={category}
            mode={mode}
            contents={filteredContents}
            questions={filteredQuestions}
            onBack={() => navigate("/dashboard/best-practices")}
          />
        </div>
      </div>
    </div>
  );
}
