import { useState } from "react";
import { ChevronRight, ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { IconButton } from "@/components/ui/IconButton";
import { useRenameNotebook } from "../hooks/useNotebookMutations";
import { useCreateNote } from "../hooks/useNoteMutations";
import { SidebarNoteItem } from "./SidebarNoteItem";
import type { NoteSummary } from "../types/workspace.types";

interface Props {
  workspaceId: string;
  notebook: { id: string; title: string; notes: NoteSummary[] };
  activeNoteId?: string;
  onSelectNote: (noteId: string) => void;
  // Accepts both — a notebook's own delete request, and delete requests bubbled up
  // from the SidebarNoteItem rows nested inside it.
  onDeleteRequest: (payload: { type: "notebook" | "note"; id: string; label: string }) => void;
}

export function SidebarNotebookItem({
  workspaceId,
  notebook,
  activeNoteId,
  onSelectNote,
  onDeleteRequest,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(notebook.title);

  const renameNotebook = useRenameNotebook(workspaceId);
  const createNote = useCreateNote(workspaceId);

  function commitRename() {
    setIsRenaming(false);
    const trimmed = draftTitle.trim();
    // Skip the request entirely if nothing changed or it's empty — don't hit the API for no-ops
    if (!trimmed || trimmed === notebook.title) {
      setDraftTitle(notebook.title);
      return;
    }
    renameNotebook.mutate({ id: notebook.id, title: trimmed });
  }

  return (
    <div>
      {/* Notebook row */}
      <div className="group flex items-center h-[32px] px-2 rounded-sm hover:bg-bg-hover">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-text-muted hover:text-text-primary shrink-0"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {isRenaming ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setDraftTitle(notebook.title);
                setIsRenaming(false);
              }
            }}
            className="ml-1.5 flex-1 min-w-0 text-sm bg-bg border border-accent rounded-sm px-1 outline-none"
          />
        ) : (
          <span
            onDoubleClick={() => setIsRenaming(true)}
            className="ml-1.5 flex-1 min-w-0 truncate text-sm font-medium text-text-primary"
          >
            {notebook.title}
          </span>
        )}

        {/* Hover-only actions — kept hidden by default so the tree stays visually quiet */}
        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <IconButton title="New note" onClick={() => createNote.mutate(notebook.id)}>
            <Plus size={14} />
          </IconButton>
          <DropdownMenu trigger={<IconButton title="More"><MoreHorizontal size={14} /></IconButton>}>
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>Rename</DropdownMenuItem>
            <DropdownMenuItem
              danger
              onClick={() =>
                onDeleteRequest({ type: "notebook", id: notebook.id, label: notebook.title })
              }
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>

      {/* Notes inside this notebook — reuses SidebarNoteItem so rename/delete
          behave identically whether a note is filed here or sitting unfiled. */}
      {expanded && (
        <div className="ml-5 border-l border-border pl-2">
          {notebook.notes.length === 0 ? (
            <div className="px-2 py-1 text-xs text-text-muted italic">No notes yet</div>
          ) : (
            notebook.notes.map((note) => (
              <SidebarNoteItem
                key={note.id}
                note={note}
                isActive={activeNoteId === note.id}
                onSelect={() => onSelectNote(note.id)}
                onDeleteRequest={() =>
                  onDeleteRequest({ type: "note", id: note.id, label: note.title })
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}