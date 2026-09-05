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

  // New: inline "create note" state — mirrors the rename pattern above
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");

  const renameNotebook = useRenameNotebook(workspaceId);
  const createNote = useCreateNote(workspaceId);

  function commitRename() {
    setIsRenaming(false);
    const trimmed = draftTitle.trim();
    if (!trimmed || trimmed === notebook.title) {
      setDraftTitle(notebook.title);
      return;
    }
    renameNotebook.mutate({ id: notebook.id, title: trimmed });
  }

  function startCreatingNote() {
    // Make sure the notebook is open so the new input row is actually visible
    setExpanded(true);
    setNewNoteTitle("");
    setIsCreatingNote(true);
  }

  function commitCreateNote() {
    const trimmed = newNoteTitle.trim();
    setIsCreatingNote(false);
    if (!trimmed) return; // cancel silently if left empty
    createNote.mutate({ notebookId: notebook.id, title: trimmed });
  }

  function cancelCreateNote() {
    setIsCreatingNote(false);
    setNewNoteTitle("");
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
            className="flex-1 min-w-0 text-sm bg-bg text-text-primary border border-accent rounded-sm px-1 outline-none placeholder:text-text-muted"
          />
        ) : (
          <span
            onDoubleClick={() => setIsRenaming(true)}
            className="ml-1.5 flex-1 min-w-0 truncate text-sm font-medium text-text-primary"
          >
            {notebook.title}
          </span>
        )}

        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <IconButton title="New note" onClick={startCreatingNote}>
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

      {/* Notes inside this notebook */}
      {expanded && (
        <div className="ml-5 border-l border-border pl-2">
          {isCreatingNote && (
            <div className="flex items-center h-[28px] px-2">
              <input
                autoFocus
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onBlur={commitCreateNote}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitCreateNote();
                  if (e.key === "Escape") cancelCreateNote();
                }}
                placeholder="Note title"
                className="flex-1 min-w-0 text-sm bg-bg border border-accent rounded-sm px-1 outline-none"
              />
            </div>
          )}

          {notebook.notes.length === 0 && !isCreatingNote ? (
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