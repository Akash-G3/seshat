import { NotebookPen } from "lucide-react";

export function LibraryEmptyState() {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent-subtle text-accent">
        <NotebookPen size={16} strokeWidth={1.8} />
      </div>
      <p className="text-sm text-text-secondary">Nothing here yet</p>
      <p className="mt-1 text-xs leading-relaxed text-text-muted">
        Start a note or a notebook from the icons on the left.
      </p>
    </div>
  );
}