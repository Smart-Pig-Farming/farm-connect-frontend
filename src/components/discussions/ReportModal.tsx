import { useState } from "react";
import {
  AlertTriangle,
  X,
  ShieldAlert,
  DollarSign,
  FileText,
  Settings,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details?: string) => void;
  postTitle: string;
}

const reportReasons = [
  {
    id: "inappropriate",
    label: "Inappropriate or offensive content",
    icon: AlertTriangle,
    description: "Contains hate speech, harassment, or inappropriate language",
  },
  {
    id: "spam",
    label: "Spam or repetitive posting",
    icon: ShieldAlert,
    description: "Duplicate content, excessive self-promotion, or spam",
  },
  {
    id: "fraudulent",
    label: "Fraudulent or misleading market listing",
    icon: DollarSign,
    description: "False product claims, scam listings, or misleading prices",
  },
  {
    id: "misinformation",
    label: "Misinformation about farming practices",
    icon: FileText,
    description: "Incorrect or harmful advice about animal care or farming",
  },
  {
    id: "technical",
    label: "Technical issues",
    icon: Settings,
    description: "Broken links, formatting problems, or display issues",
  },
  {
    id: "other",
    label: "Other",
    icon: Flag,
    description: "Something else not covered by the above categories",
  },
];

export function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  postTitle,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedReason, additionalDetails);
      // Reset form
      setSelectedReason("");
      setAdditionalDetails("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setAdditionalDetails("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-300 scale-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Report Content
                </h3>
                <p className="text-sm text-gray-600">
                  Help us maintain community standards
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Post Info */}
            <div className="mb-6 p-3 bg-gray-50 rounded-lg border">
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Reporting Post:
              </Label>
              <p className="text-sm text-gray-900 font-medium line-clamp-2">
                {postTitle}
              </p>
            </div>

            {/* Warning */}
            <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Important:</strong> We take community safety seriously.
                Please only report content that violates our community
                guidelines. False reports may affect your account standing.
              </p>
            </div>

            {/* Reason Selection */}
            <div className="mb-6">
              <Label className="text-base font-medium text-gray-900 mb-4 block">
                Why are you reporting this content?
              </Label>
              <div className="space-y-2">
                {reportReasons.map((reason) => {
                  const IconComponent = reason.icon;
                  return (
                    <label
                      key={reason.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedReason === reason.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.id}
                        checked={selectedReason === reason.id}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`p-1 rounded-md ${
                          selectedReason === reason.id
                            ? "bg-orange-200"
                            : "bg-gray-200"
                        }`}
                      >
                        <IconComponent
                          className={`h-4 w-4 ${
                            selectedReason === reason.id
                              ? "text-orange-600"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-medium text-sm mb-1 ${
                            selectedReason === reason.id
                              ? "text-orange-900"
                              : "text-gray-900"
                          }`}
                        >
                          {reason.label}
                        </div>
                        <div
                          className={`text-xs ${
                            selectedReason === reason.id
                              ? "text-orange-700"
                              : "text-gray-600"
                          }`}
                        >
                          {reason.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Additional Details */}
            <div className="mb-6">
              <Label
                htmlFor="details"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Additional details (optional)
              </Label>
              <textarea
                id="details"
                rows={3}
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Provide any additional context that might help our moderators..."
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-200 resize-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Help us understand the issue better
                </p>
                <span className="text-xs text-gray-400">
                  {additionalDetails.length}/500
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedReason || isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
