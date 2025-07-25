import { useState } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle,
  Trash2,
  AlertCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ModerationDecision = "retained" | "deleted" | "warned";

interface ModerationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (decision: ModerationDecision, justification: string) => void;
  action: ModerationDecision | null;
  postTitle: string;
  authorName: string;
  reportCount: number;
  isProcessing?: boolean;
}

export function ModerationActionModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  postTitle,
  authorName,
  reportCount,
  isProcessing = false,
}: ModerationActionModalProps) {
  const [justification, setJustification] = useState("");

  if (!isOpen || !action) return null;

  const getActionConfig = (action: ModerationDecision) => {
    switch (action) {
      case "deleted":
        return {
          title: "Delete Post",
          description:
            "This action will permanently remove the post from the platform",
          icon: <Trash2 className="h-6 w-6 text-white" />,
          iconBg: "bg-red-600",
          borderColor: "border-red-200",
          bgColor: "bg-red-50",
          buttonColor: "bg-red-600 hover:bg-red-700",
          badge: "DELETE",
          badgeColor: "bg-red-100 text-red-800",
          placeholderText:
            "Explain why this post violates community guidelines...",
          examples: [
            "Contains inappropriate content that violates community standards",
            "Confirmed spam or fraudulent listing",
            "Spreads misinformation about farming practices",
          ],
        };
      case "retained":
        return {
          title: "Retain Post",
          description:
            "This post will remain visible and reports will be marked as resolved",
          icon: <CheckCircle className="h-6 w-6 text-white" />,
          iconBg: "bg-green-600",
          borderColor: "border-green-200",
          bgColor: "bg-green-50",
          buttonColor: "bg-green-600 hover:bg-green-700",
          badge: "RETAIN",
          badgeColor: "bg-green-100 text-green-800",
          placeholderText: "Explain why this post should remain (optional)...",
          examples: [
            "Content is factually accurate and follows guidelines",
            "Reports appear to be false or malicious",
            "Post provides valuable information to the farming community",
          ],
        };
      case "warned":
        return {
          title: "Warn Author",
          description:
            "The post will remain but the author will receive a warning",
          icon: <AlertCircle className="h-6 w-6 text-white" />,
          iconBg: "bg-yellow-600",
          borderColor: "border-yellow-200",
          bgColor: "bg-yellow-50",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700",
          badge: "WARN",
          badgeColor: "bg-yellow-100 text-yellow-800",
          placeholderText: "Explain what the author should improve...",
          examples: [
            "Please cite reliable sources for your claims",
            "Tone down promotional language in future posts",
            "Ensure content is directly related to farming topics",
          ],
        };
    }
  };

  const config = getActionConfig(action);

  const handleSubmit = () => {
    onConfirm(action, justification.trim());
    setJustification("");
  };

  const handleClose = () => {
    setJustification("");
    onClose();
  };

  const isJustificationRequired = action === "deleted" || action === "warned";
  const canSubmit = !isJustificationRequired || justification.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div
            className={`flex items-center gap-4 p-6 border-b ${config.borderColor} ${config.bgColor}`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.iconBg} shadow-lg`}
            >
              {config.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {config.title}
                </h2>
                <Badge className={`text-xs font-semibold ${config.badgeColor}`}>
                  {config.badge}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="rounded-full h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Post Information */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {postTitle}
                  </h3>
                  <p className="text-sm text-gray-600">by {authorName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">
                    {reportCount} Report{reportCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Justification Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Justification
                  {isJustificationRequired && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {!isJustificationRequired && (
                  <span className="text-xs text-gray-500">(Optional)</span>
                )}
              </div>

              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder={config.placeholderText}
                className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm leading-relaxed"
                maxLength={500}
              />

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{justification.length}/500 characters</span>
                {isJustificationRequired &&
                  justification.trim().length === 0 && (
                    <span className="text-red-500">
                      Justification is required
                    </span>
                  )}
              </div>

              {/* Quick Examples */}
              {config.examples && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">
                      Common justifications:
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {config.examples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setJustification(example)}
                        className="text-left text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 p-2 rounded-lg transition-colors border border-gray-100 hover:border-gray-200"
                      >
                        • {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isProcessing}
              className={`px-6 text-white ${config.buttonColor} disabled:opacity-50`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                `Confirm ${config.title}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
