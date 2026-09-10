import { FileText, Folder } from "lucide-react";
import { NotebookItem } from "./components/NotebookItem/NotebookItem";
import { NoteItem } from "./components/NoteItem/NoteItem";
import { LibraryEmptyState } from "./components/LibraryEmptyState/LibraryEmptyState";
import type { WorkspaceTree } from "@features/workspace/types/workspace.types";

interface Props {
  tree: WorkspaceTree;
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: (notebookId: string | null, title: string) => void;
  onCreateNotebook: (parentId: string, title: string) => void;
  onRenameNote: (id: string, title: string) => void;
  onDeleteNote: (id: string) => void;
  onRenameNotebook: (id: string, title: string) => void;
  onDeleteNotebook: (id: string) => void;
}

export function Library({ tree, activeNoteId, onSelectNote, onCreateNote, onCreateNotebook, onRenameNote, onDeleteNote, onRenameNotebook, onDeleteNotebook }: Props) {
  const empty = tree.notebooks.length === 0 && tree.unfiledNotes.length === 0;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-bg">
      <div className="flex h-10 items-center gap-2 border-b border-border px-3">
        <Folder size={14} className="text-text-muted" />
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Library</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {tree.notebooks.map((notebook) => (
          <NotebookItem key={notebook.id} notebook={notebook} activeNoteId={activeNoteId} onSelectNote={onSelectNote} onCreateNote={onCreateNote} onCreateNotebook={onCreateNotebook} onRenameNotebook={onRenameNotebook} onDeleteNotebook={() => onDeleteNotebook(notebook.id)} onRenameNote={onRenameNote} onDeleteNote={onDeleteNote} />
        ))}

        {tree.unfiledNotes.length > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            <div className="flex h-7 items-center gap-1.5 px-2 text-xs font-medium text-text-muted">
              <FileText size={12} /> Unfiled
            </div>
            {tree.unfiledNotes.map((note) => (
              <NoteItem key={note.id} note={note} active={note.id === activeNoteId} onSelect={() => onSelectNote(note.id)} onRename={onRenameNote} onDelete={() => onDeleteNote(note.id)} />
            ))}
          </div>
        )}

        {empty && <LibraryEmptyState />}
      </div>
    </aside>
  );
}
