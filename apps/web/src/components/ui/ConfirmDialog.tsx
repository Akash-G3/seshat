// Simple centered confirm modal — used for destructive actions (delete notebook/note).
// Deliberately plain: a title, a message, cancel + confirm. No animation library needed.
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px]">
      <div className="w-80 animate-[menu-in_0.15s_ease-out] rounded-lg border border-border bg-bg p-5 shadow-[var(--shadow-md)]">
        <h2 className="mb-1 text-sm font-semibold text-text-primary">{title}</h2>
        <p className="mb-4 text-sm text-text-secondary">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-sm text-text-secondary transition-colors duration-150 hover:bg-bg-hover"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-danger px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-danger/90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}