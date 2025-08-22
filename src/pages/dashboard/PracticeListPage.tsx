import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PracticeListView } from "@/components/bestPractices/PracticeListView";
import { EditContentWizard } from "@/components/bestPractices/EditContentWizard";
import { BEST_PRACTICE_CATEGORIES } from "@/components/bestPractices/constants";
import type {
  BestPracticeCategory,
  BestPracticeContentDraft,
} from "@/types/bestPractices";
import {
  fetchPracticesPage,
  BEST_PRACTICES_PAGE_SIZE,
} from "@/data/bestPracticesMock";
import { BookOpen } from "lucide-react";

// Dedicated practice list route page: /dashboard/best-practices/category/:categoryKey
export function PracticeListPage() {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");
  const [contents, setContents] = useState<BestPracticeContentDraft[]>([]);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContent, setEditingContent] =
    useState<BestPracticeContentDraft | null>(null);

  const category: BestPracticeCategory | undefined =
    BEST_PRACTICE_CATEGORIES.find((c) => c.key === categoryKey);

  useEffect(() => {
    if (!category) return;
    // If user manually appends ?mode=quiz to the practice list route, redirect them to the quiz navigation page
    if (modeParam === "quiz") {
      navigate(`/dashboard/best-practices/category/${category.key}/quiz`, {
        replace: true,
      });
      return;
    }
    if (contents.length === 0) {
      fetchPracticesPage(0, BEST_PRACTICES_PAGE_SIZE, category.key).then((r) =>
        setContents(r.data)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey, modeParam]);

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-emerald-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/10 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Category Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            The category you're looking for doesn't exist or may have been
            moved.
          </p>
          <button
            onClick={() => navigate("/dashboard/best-practices")}
            className="group relative px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold overflow-hidden transition-all duration-300 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5"
          >
            <span className="relative z-10">Back to Best Practices</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    );
  }

  const filteredContents = contents.filter((c) =>
    c.categories.includes(category.key)
  );

  // Handler functions for edit and delete actions
  const handleEdit = (content: BestPracticeContentDraft) => {
    setEditingContent(content);
    setShowEditModal(true);
  };

  const handleDelete = (content: BestPracticeContentDraft) => {
    // Remove from state - the confirmation is handled in PracticeListView
    setContents((prev) => prev.filter((c) => c.id !== content.id));
    // TODO: Call backend API to delete
    console.log("Deleted practice:", content.title);
  };

  // Handle edit save
  const handleEditSave = (updatedContent: BestPracticeContentDraft) => {
    // Update the content in the list
    setContents((prev) =>
      prev.map((c) => (c.id === updatedContent.id ? updatedContent : c))
    );
    // Close the modal
    setShowEditModal(false);
    setEditingContent(null);
    // TODO: Save to backend API
    console.log("Updated practice:", updatedContent.title);
  };

  // Handle edit modal close
  const handleEditClose = () => {
    setShowEditModal(false);
    setEditingContent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-emerald-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-300/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-300/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-300/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 md:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          <PracticeListView
            category={category}
            contents={filteredContents}
            onBack={() => navigate("/dashboard/best-practices")}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Edit Content Wizard */}
      {editingContent && (
        <EditContentWizard
          open={showEditModal}
          onClose={handleEditClose}
          onSave={handleEditSave}
          content={editingContent}
        />
      )}
    </div>
  );
}
