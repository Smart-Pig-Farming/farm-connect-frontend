import { useState, useRef } from "react";
import {
  AlertTriangle,
  X,
  ShieldAlert,
  DollarSign,
  FileText,
  Settings,
  Flag,
  ChevronDown,
  Check,
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "bottom"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    setIsDropdownOpen(false);
    onClose();
  };

  const handleDropdownToggle = () => {
    if (!isDropdownOpen && dropdownRef.current) {
      // Calculate available space below and above
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 320; // max-h-80 = 20rem = 320px

      // Position dropdown above if there's more space above and not enough below
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectedReasonData = reportReasons.find((r) => r.id === selectedReason);

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
        <div className="relative w-full max-w-lg transform overflow-visible rounded-xl bg-white shadow-2xl transition-all duration-300 scale-100">
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
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Reporting Post:
              </Label>
              <p className="text-sm text-gray-900 font-medium line-clamp-2">
                {postTitle}
              </p>
            </div>

            {/* Warning */}
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Important:</strong> We take community safety seriously.
                Please only report content that violates our community
                guidelines. False reports may affect your account standing.
              </p>
            </div>

            {/* Reason Selection - Custom Dropdown */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-900 mb-3 block">
                Why are you reporting this content?{" "}
                <span className="text-red-500">*</span>
              </Label>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                    isDropdownOpen
                      ? "border-red-500 bg-red-50"
                      : selectedReason
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                  onClick={handleDropdownToggle}
                >
                  <div className="flex items-center gap-3">
                    {selectedReasonData ? (
                      <>
                        <div
                          className={`p-1.5 rounded-md ${
                            selectedReason ? "bg-green-200" : "bg-gray-200"
                          }`}
                        >
                          <selectedReasonData.icon
                            className={`h-4 w-4 ${
                              selectedReason
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm text-gray-900">
                            {selectedReasonData.label}
                          </div>
                          <div className="text-xs text-gray-600">
                            {selectedReasonData.description}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        Select a reason for reporting...
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Options */}
                {isDropdownOpen && (
                  <div
                    className={`absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto ${
                      dropdownPosition === "bottom"
                        ? "top-full mt-1"
                        : "bottom-full mb-1"
                    }`}
                  >
                    {reportReasons.map((reason) => {
                      const IconComponent = reason.icon;
                      const isSelected = selectedReason === reason.id;

                      return (
                        <button
                          key={reason.id}
                          type="button"
                          className={`w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                            isSelected ? "bg-green-50" : ""
                          }`}
                          onClick={() => {
                            setSelectedReason(reason.id);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <div
                            className={`p-1.5 rounded-md flex-shrink-0 ${
                              isSelected ? "bg-green-200" : "bg-gray-200"
                            }`}
                          >
                            <IconComponent
                              className={`h-4 w-4 ${
                                isSelected ? "text-green-600" : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`font-medium text-sm mb-1 ${
                                isSelected ? "text-green-900" : "text-gray-900"
                              }`}
                            >
                              {reason.label}
                            </div>
                            <div
                              className={`text-xs ${
                                isSelected ? "text-green-700" : "text-gray-600"
                              }`}
                            >
                              {reason.description}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
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
                rows={4}
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Provide any additional context that might help our moderators understand the issue better..."
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 resize-none text-sm"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Help us understand the issue better
                </p>
                <span className="text-xs text-gray-400">
                  {additionalDetails.length}/500
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
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
