
import { FileText, X } from "lucide-react";
import type { OpenTab } from "../../types";

interface Props {
  tab: OpenTab;
  active: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export function NoteTab({
  tab,
  active,
  onSelect,
  onClose,
}: Props) {
  return (
    <div
      className={`
        group
        flex
        h-8
        min-w-0
        max-w-48
        shrink-0
        items-center
        rounded-md
        transition-colors
        duration-150
        ${
          active
            ? "bg-bg text-text-primary shadow-[var(--shadow-sm)]"
            : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
        }
      `}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-1.5 px-2.5 text-sm"
      >
        <FileText
          size={13}
          className="shrink-0"
          strokeWidth={1.7}
        />

        <span className="truncate">
          {tab.title || "Untitled"}
        </span>
      </button>

      <button
        type="button"
        title="Close tab"
        aria-label={`Close ${
          tab.title || "Untitled"
        }`}
        onClick={onClose}
        className={`
          mr-1
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
          rounded-sm
          text-text-muted
          opacity-0
          transition-opacity
          duration-150
          hover:bg-bg-hover
          hover:text-text-primary
          group-hover:opacity-100
          ${active ? "opacity-70" : ""}
        `}
      >
        <X
          size={13}
          strokeWidth={1.8}
        />
      </button>
    </div>
  );
}