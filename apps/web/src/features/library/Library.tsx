// FIXED VERSION - src/features/library/Library.tsx
// Only showing the key changes - paste this over the existing Library component

import { useCallback, useEffect, useState, useMemo } from "react";
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
import type {
  WorkspaceTree,
} from "@features/workspace/types/workspace.types";

// ... Props interface stays the same ...

export function Library({
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

  // Clear root creation input when mode changes
  useEffect(() => {
    if (createMode) {
      setNewTitle("");
    }
  }, [createMode]);

  // ✅ FIX #1: Memoize all callbacks passed to children
  // This prevents unnecessary re-renders of NotebookItem and NoteItem components
  const handleSelectNote = useCallback((id: string) => {
    onSelectNote(id);
  }, [onSelectNote]);

  const handleCreateNote = useCallback((notebookId: string | null, title: string) => {
    onCreateNote(notebookId, title);
  }, [onCreateNote]);

  const handleCreateNotebook = useCallback((parentId: string | null, title: string) => {
    onCreateNotebook(parentId, title);
  }, [onCreateNotebook]);

  const handleRenameNote = useCallback((id: string, title: string) => {
    onRenameNote(id, title);
  }, [onRenameNote]);

  const handleDeleteNote = useCallback((id: string) => {
    onDeleteNote(id);
  }, [onDeleteNote]);

  const handleRenameNotebook = useCallback((id: string, title: string) => {
    onRenameNotebook(id, title);
  }, [onRenameNotebook]);

  const handleDeleteNotebook = useCallback((id: string) => {
    onDeleteNotebook(id);
  }, [onDeleteNotebook]);

  const handleToggleFavourite = useCallback(
    (type: "note" | "notebook", id: string, isFavourite: boolean) => {
      onToggleFavourite(type, id, isFavourite);
    },
    [onToggleFavourite],
  );

  const handleShareNote = useCallback((id: string) => {
    onShareNote(id);
  }, [onShareNote]);

  const handleShareNotebook = useCallback((id: string) => {
    onShareNotebook(id);
  }, [onShareNotebook]);

  const handleCopyNote = useCallback((id: string) => {
    onCopyNote(id);
  }, [onCopyNote]);

  const handleCopyNotebook = useCallback((id: string) => {
    onCopyNotebook(id);
  }, [onCopyNotebook]);

  const handleExportNote = useCallback((id: string) => {
    onExportNote(id);
  }, [onExportNote]);

  // ✅ FIX #2: Memoize computed values
  const empty = useMemo(
    () => tree.notebooks.length === 0 && tree.unfiledNotes.length === 0,
    [tree],
  );

  function cancelCreate() {
    setNewTitle("");
    onCreateModeChange?.(null);
  }

  function commitCreate() {
    const title = newTitle.trim();

    if (!title || !createMode) {
      cancelCreate();
      return;
    }

    if (createMode === "note") {
      handleCreateNote(null, title);
    } else {
      handleCreateNotebook(null, title);
    }

    setNewTitle("");
    onCreateModeChange?.(null);
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-bg-subtle">
      {/* Library header */}
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
            onSelectNote={handleSelectNote}
            onRemoveFavourite={(type, id) => 
              handleToggleFavourite(type, id, true)
            }
          />
        ) : view === "tags" ? (
          <TagsView workspaceId={workspaceId} />
        ) : view === "trash" ? (
          <TrashView workspaceId={workspaceId} />
        ) : (
          <div className="p-1.5">
            {/* Root-level creation */}
            {createMode && (
              <div className="mb-1 flex h-8 items-center">
                {createMode === "note" ? (
                  <FileText
                    size={14}
                    className="mr-1.5 shrink-0 text-text-muted"
                    strokeWidth={1.7}
                  />
                ) : (
                  <Folder
                    size={14}
                    className="mr-1.5 shrink-0 text-text-muted"
                    strokeWidth={1.7}
                  />
                )}

                <input
                  autoFocus
                  value={newTitle}
                  onChange={(event) =>
                    setNewTitle(event.target.value)
                  }
                  onBlur={commitCreate}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      commitCreate();
                    }
                    if (event.key === "Escape") {
                      cancelCreate();
                    }
                  }}
                  placeholder={
                    createMode === "note"
                      ? "Note title"
                      : "Notebook name"
                  }
                  className="min-w-0 flex-1 rounded-md border border-accent bg-bg px-1.5 py-1 text-sm text-text-primary outline-none"
                />
              </div>
            )}

            {/* Root notebooks */}
            {tree.notebooks.map(
              (notebook) => (
                <NotebookItem
                  key={notebook.id}
                  notebook={notebook}
                  activeNoteId={activeNoteId}
                  favouriteIds={favouriteIds}
                  onSelectNote={handleSelectNote}  // ✅ Now memoized
                  onCreateNote={handleCreateNote}  // ✅ Now memoized
                  onCreateNotebook={handleCreateNotebook}  // ✅ Now memoized
                  onRenameNotebook={handleRenameNotebook}  // ✅ Now memoized
                  onDeleteNotebook={handleDeleteNotebook}  // ✅ Now memoized
                  onRenameNote={handleRenameNote}  // ✅ Now memoized
                  onDeleteNote={handleDeleteNote}  // ✅ Now memoized
                  onToggleFavourite={handleToggleFavourite}  // ✅ Now memoized
                  onShare={handleShareNotebook}  // ✅ Now memoized
                  onCopy={handleCopyNotebook}  // ✅ Now memoized
                  onExport={handleExportNote}  // ✅ Now memoized
                />
              ),
            )}

            {/* Unfiled notes */}
            {tree.unfiledNotes.length > 0 && (
              <div className="mt-2 border-t border-border pt-2">
                <div className="flex h-7 items-center gap-1.5 px-2 text-xs font-medium text-text-muted">
                  <FileText
                    size={12}
                    strokeWidth={1.7}
                  />
                  Unfiled
                </div>

                {tree.unfiledNotes.map(
                  (note) => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      active={
                        note.id === activeNoteId
                      }
                      isFavourite={favouriteIds.has(
                        `note:${note.id}`,
                      )}
                      onSelect={() =>
                        handleSelectNote(note.id)  // ✅ Now memoized
                      }
                      onRename={handleRenameNote}  // ✅ Now memoized
                      onDelete={() =>
                        handleDeleteNote(note.id)  // ✅ Now memoized
                      }
                      onFavourite={() =>
                        handleToggleFavourite(
                          "note",
                          note.id,
                          favouriteIds.has(
                            `note:${note.id}`,
                          ),
                        )
                      }
                      onShare={() => handleShareNote(note.id)}  // ✅ Now memoized
                      onCopy={() => handleCopyNote(note.id)}  // ✅ Now memoized
                      onExport={() => handleExportNote(note.id)}  // ✅ Now memoized
                    />
                  ),
                )}
              </div>
            )}

            {empty && !createMode && (
              <LibraryEmptyState />
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
