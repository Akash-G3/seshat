import { useState } from "react";
import { FileText, X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useUpdateNote } from "../hooks/useNoteMutations";
import type { NoteSummary } from "../types/workspace.types";

interface Props {
  note: NoteSummary;
  isActive: boolean;
  onSelect: () => void;
  onDeleteRequest: () => void;
}

export function SidebarNoteItem({ note, isActive, onSelect, onDeleteRequest }: Props) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(note.title);
  const updateNote = useUpdateNote(note.id);

  function commitRename() {
    setIsRenaming(false);
    const trimmed = draftTitle.trim();
    // Skip the request if nothing changed or it's empty — don't hit the API for no-ops
    if (!trimmed || trimmed === note.title) {
      setDraftTitle(note.title);
      return;
    }
    updateNote.mutate({ title: trimmed });
  }

  return (
    <div
      className={`group flex items-center h-[32px] px-2 rounded-sm text-sm transition-colors ${
        isActive
          ? "bg-accent-subtle text-accent border-l-2 border-accent -ml-[2px] pl-[7px]"
          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary cursor-pointer"
      }`}
      onClick={isRenaming ? undefined : onSelect}
    >
      <FileText size={13} className="shrink-0 mr-1.5" />

      {isRenaming ? (
        <input
          autoFocus
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={commitRename}
          onClick={(e) => e.stopPropagation()} // don't trigger onSelect while editing
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setDraftTitle(note.title);
              setIsRenaming(false);
            }
          }}
          className="flex-1 min-w-0 bg-bg text-text-primary border border-accent rounded-sm px-1 outline-none"
        />
      ) : (
        <span
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsRenaming(true);
          }}
          className="flex-1 truncate"
        >
          {note.title || "Untitled"}
        </span>
      )}

      <IconButton
        variant="danger"
        title="Delete note"
        className="hidden group-hover:inline-flex shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteRequest();
        }}
      >
        <X size={13} />
      </IconButton>
    </div>
  );
}