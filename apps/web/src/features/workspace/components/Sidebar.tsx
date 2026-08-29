import { useState } from "react";
import { useWorkspaceTree } from "../hooks/useWorkspaceTree";
import { useCreateNotebook, useDeleteNotebook } from "../hooks/useNotebookMutations";
import { useCreateNote, useDeleteNote } from "../hooks/useNoteMutations";
import { SidebarNotebookItem } from "./SidebarNotebookItem";
import { SidebarNoteItem } from "./SidebarNoteItem";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface SidebarProps {
  activeNoteId?: string;
  onSelectNote: (noteId: string) => void;
}

type DeleteTarget = { type: "notebook" | "note"; id: string; label: string } | null;

export function Sidebar({ activeNoteId, onSelectNote }: SidebarProps) {
  const { workspace, tree, isLoading, isError } = useWorkspaceTree();
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const workspaceId = workspace?.id ?? "";
  const createNotebook = useCreateNotebook(workspaceId);
  const deleteNotebook = useDeleteNotebook(workspaceId);
  const createNote = useCreateNote(workspaceId);
  const deleteNote = useDeleteNote();

  function submitNewNotebook() {
    const title = newNotebookTitle.trim();
    if (title) createNotebook.mutate(title);
    setNewNotebookTitle("");
    setIsCreatingNotebook(false);
  }

  function submitNewNote() {
    // Always create — even a blank title falls back to "Untitled" inside the hook —
    // so Enter or blur always produces a note, just like Notion's "type to name, blank is fine" behavior
    createNote.mutate({ notebookId: null, title: newNoteTitle });
    setNewNoteTitle("");
    setIsCreatingNote(false);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "notebook") deleteNotebook.mutate(deleteTarget.id);
    else deleteNote.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }

  if (isLoading) {
    return <div className="w-[260px] p-4 text-sm text-text-muted">Loading workspace…</div>;
  }
  if (isError || !tree || !workspace) {
    return <div className="w-[260px] p-4 text-sm text-danger">Couldn't load workspace</div>;
  }

  return (
    <aside className="w-[260px] h-full bg-bg-subtle border-r border-border flex flex-col">
      <WorkspaceHeader
        workspaceName={workspace.name}
        onNewNotebook={() => setIsCreatingNotebook(true)}
        onNewNote={() => setIsCreatingNote(true)}
      />

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {tree.notebooks.map((notebook) => (
          <SidebarNotebookItem
            key={notebook.id}
            workspaceId={workspaceId}
            notebook={notebook}
            activeNoteId={activeNoteId}
            onSelectNote={onSelectNote}
            onDeleteRequest={setDeleteTarget}
          />
        ))}

        {isCreatingNotebook && (
          <input
            autoFocus
            value={newNotebookTitle}
            onChange={(e) => setNewNotebookTitle(e.target.value)}
            onBlur={submitNewNotebook}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitNewNotebook();
              if (e.key === "Escape") {
                setNewNotebookTitle("");
                setIsCreatingNotebook(false);
              }
            }}
            placeholder="Notebook name"
            className="w-full h-[32px] px-2 text-sm bg-bg border border-accent rounded-sm outline-none"
          />
        )}

        {(tree.unfiledNotes.length > 0 || isCreatingNote) && (
          <div className="mt-4">
            <div className="px-2 py-1 text-xs font-medium text-text-muted uppercase tracking-wide">
              Notes
            </div>

            {isCreatingNote && (
              <input
                autoFocus
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onBlur={submitNewNote}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitNewNote();
                  if (e.key === "Escape") {
                    setNewNoteTitle("");
                    setIsCreatingNote(false);
                  }
                }}
                placeholder="Note title"
                className="w-full h-[32px] px-2 text-sm bg-bg border border-accent rounded-sm outline-none"
              />
            )}

            {tree.unfiledNotes.map((note) => (
              <SidebarNoteItem
                key={note.id}
                note={note}
                isActive={activeNoteId === note.id}
                onSelect={() => onSelectNote(note.id)}
                onDeleteRequest={() => setDeleteTarget({ type: "note", id: note.id, label: note.title })}
              />
            ))}
          </div>
        )}

        {tree.notebooks.length === 0 && tree.unfiledNotes.length === 0 && !isCreatingNotebook && !isCreatingNote && (
          <div className="px-2 py-8 text-center">
            <p className="text-sm text-text-muted mb-2">Nothing here yet</p>
            <p className="text-xs text-text-muted">Use the + menu above to add a notebook or note</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.type}`}
        message={`Are you sure you want to delete "${deleteTarget?.label}"? This can't be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </aside>
  );
}