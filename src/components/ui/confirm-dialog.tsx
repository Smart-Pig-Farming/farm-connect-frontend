import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  className,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        className
      )}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!loading ? onCancel : undefined} />

      <div className="relative w-full max-w-sm rounded-lg bg-white shadow-xl border border-gray-200">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-gray-600">{description}</p>
          )}
        </div>
        <div className="px-4 py-3 flex items-center justify-end gap-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            autoFocus
            className={cn(
              "px-3 py-1.5 text-xs sm:text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "px-3 py-1.5 text-xs sm:text-sm rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
