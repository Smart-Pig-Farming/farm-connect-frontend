import { X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmButtonClass?: string;
  icon?: React.ReactNode;
  iconBgClass?: string;
  extraMessage?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmButtonClass = "bg-orange-600 hover:bg-orange-700",
  icon,
  iconBgClass = "bg-orange-100",
  extraMessage,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 break-words pr-4">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          {icon && (
            <div className="flex items-center mb-4">
              <div
                className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconBgClass}`}
              >
                {icon}
              </div>
            </div>
          )}
          <p className="text-center text-gray-700 break-words">{message}</p>
          {extraMessage && (
            <p className="text-center text-sm text-gray-500 mt-2 break-words">
              {extraMessage}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1 break-words"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg order-1 sm:order-2 break-words ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
