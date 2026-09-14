import { memo, useCallback, useEffect, useState } from "react";
import {
  FileText,
  Folder,
  Library as LibraryIcon,
  Star,
  Tags,
  Trash2,
} from "lucide-react";

import { NotebookItem } from "./components/NotebookItem/NotebookItem";
import { NoteItem } from "./components/NoteItem/NoteItem";
import { LibraryEmptyState } from "./components/LibraryEmptyState/LibraryEmptyState";
import { FavouritesView } from "./components/FavouritesView/FavouritesView";
import { TagsView } from "@features/tags/components/TagsView/TagsView";
import { TrashView } from "@features/trash/components/TrashView/TrashView";

import type { Favourite } from "@features/favourites/types/favourite.types";
import type { WorkspaceTree } from "@features/workspace/types/workspace.types";

type LibraryView = "workspace" | "favourites" | "tags" | "trash";
type CreateMode = "note" | "notebook" | null;

interface Props {
  tree: WorkspaceTree;
  activeNoteId: string | null;
  view: LibraryView;
  createMode?: CreateMode;
  onCreateModeChange?: (mode: CreateMode) => void;
  favourites: Favourite[];
  favouriteIds: Set<string>;
  onSelectNote: (id: string) => void;
  onCreateNote: (notebookId: string | null, title: string) => void;
  onCreateNotebook: (parentId: string | null, title: string) => void;
  onRenameNote: (id: string, title: string) => void;
  onDeleteNote: (id: string) => void;
  onRenameNotebook: (id: string, title: string) => void;
  onDeleteNotebook: (id: string) => void;
  onToggleFavourite: (
    type: "note" | "notebook",
    id: string,
    isFavourite: boolean,
  ) => void;
  onOpenLibrary: () => void;
  workspaceId: string;
  onShareNote: (id: string) => void;
  onShareNotebook: (id: string) => void;
  onCopyNote: (id: string) => void;
  onCopyNotebook: (id: string) => void;
  onExportNote: (id: string) => void;
}

export const Library = memo(function Library({
  tree,
  activeNoteId,
  view,
  createMode = null,
  onCreateModeChange,
  favourites,
  favouriteIds,
  onSelectNote,
  onCreateNote,
  onCreateNotebook,
  onRenameNote,
  onDeleteNote,
  onRenameNotebook,
  onDeleteNotebook,
  onToggleFavourite,
  onOpenLibrary,
  workspaceId,
  onShareNote,
  onShareNotebook,
  onCopyNote,
  onCopyNotebook,
  onExportNote,
}: Props) {
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (createMode) setNewTitle("");
  }, [createMode]);

  const handleToggleNoteFavourite = useCallback(
    (id: string, isFavourite: boolean) => {
      onToggleFavourite("note", id, isFavourite);
    },
    [onToggleFavourite],
  );

  const handleRemoveFavourite = useCallback(
    (type: "note" | "notebook", id: string) => {
      onToggleFavourite(type, id, true);
    },
    [onToggleFavourite],
  );

  const cancelCreate = useCallback(() => {
    setNewTitle("");
    onCreateModeChange?.(null);
  }, [onCreateModeChange]);

  const commitCreate = useCallback(() => {
    const title = newTitle.trim();

    if (!title || !createMode) {
      cancelCreate();
      return;
    }

    if (createMode === "note") {
      onCreateNote(null, title);
    } else {
      onCreateNotebook(null, title);
    }

    setNewTitle("");
    onCreateModeChange?.(null);
  }, [
    cancelCreate,
    createMode,
    newTitle,
    onCreateModeChange,
    onCreateNote,
    onCreateNotebook,
  ]);

  const empty = tree.notebooks.length === 0 && tree.unfiledNotes.length === 0;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-bg-subtle">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-bg-subtle px-3.5">
        {view === "favourites" ? (
          <>
            <button
              type="button"
              onClick={onOpenLibrary}
              title="Open library"
              aria-label="Open library"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-bg-hover hover:text-text-primary"
            >
              <LibraryIcon size={15} strokeWidth={1.7} />
            </button>
            <Star size={14} strokeWidth={1.7} className="text-text-muted" />
            <span className="text-sm font-medium text-text-primary">Favourites</span>
          </>
        ) : view === "tags" ? (
          <>
            <Tags size={15} strokeWidth={1.7} className="text-text-muted" />
            <span className="text-sm font-medium text-text-primary">Tags</span>
          </>
        ) : view === "trash" ? (
          <>
            <Trash2 size={15} strokeWidth={1.7} className="text-text-muted" />
            <span className="text-sm font-medium text-text-primary">Trash</span>
          </>
        ) : (
          <>
            <LibraryIcon size={15} strokeWidth={1.7} className="text-text-muted" />
            <span className="text-sm font-medium text-text-primary">Library</span>
          </>
        )}
      </div>

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
        {view === "favourites" ? (
          <FavouritesView
            favourites={favourites}
            activeNoteId={activeNoteId}
            onSelectNote={onSelectNote}
            onRemoveFavourite={handleRemoveFavourite}
          />
        ) : view === "tags" ? (
          <TagsView workspaceId={workspaceId} />
        ) : view === "trash" ? (
          <TrashView workspaceId={workspaceId} />
        ) : (
          <div className="p-1.5">
            {createMode && (
              <div className="mb-1 flex h-8 items-center">
                {createMode === "note" ? (
                  <FileText size={14} className="mr-1.5 shrink-0 text-text-muted" strokeWidth={1.7} />
                ) : (
                  <Folder size={14} className="mr-1.5 shrink-0 text-text-muted" strokeWidth={1.7} />
                )}

                <input
                  autoFocus
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  onBlur={commitCreate}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") commitCreate();
                    if (event.key === "Escape") cancelCreate();
                  }}
                  placeholder={createMode === "note" ? "Note title" : "Notebook name"}
                  className="min-w-0 flex-1 rounded-md border border-accent bg-bg px-1.5 py-1 text-sm text-text-primary outline-none"
                />
              </div>
            )}

            {tree.notebooks.map((notebook) => (
              <NotebookItem
                key={notebook.id}
                notebook={notebook}
                activeNoteId={activeNoteId}
                favouriteIds={favouriteIds}
                onSelectNote={onSelectNote}
                onCreateNote={onCreateNote}
                onCreateNotebook={onCreateNotebook}
                onRenameNotebook={onRenameNotebook}
                onDeleteNotebook={onDeleteNotebook}
                onRenameNote={onRenameNote}
                onDeleteNote={onDeleteNote}
                onToggleFavourite={onToggleFavourite}
                onShareNotebook={onShareNotebook}
                onCopyNotebook={onCopyNotebook}
                onShareNote={onShareNote}
                onCopyNote={onCopyNote}
                onExportNote={onExportNote}
              />
            ))}

            {tree.unfiledNotes.length > 0 && (
              <div className="mt-2 border-t border-border pt-2">
                <div className="flex h-7 items-center gap-1.5 px-2 text-xs font-medium text-text-muted">
                  <FileText size={12} strokeWidth={1.7} />
                  Unfiled
                </div>

                {tree.unfiledNotes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    active={note.id === activeNoteId}
                    isFavourite={favouriteIds.has(`note:${note.id}`)}
                    onSelect={onSelectNote}
                    onRename={onRenameNote}
                    onDelete={onDeleteNote}
                    onFavourite={handleToggleNoteFavourite}
                    onShare={onShareNote}
                    onCopy={onCopyNote}
                    onExport={onExportNote}
                  />
                ))}
              </div>
            )}

            {empty && !createMode && <LibraryEmptyState />}
          </div>
        )}
      </div>
    </aside>
  );
});
