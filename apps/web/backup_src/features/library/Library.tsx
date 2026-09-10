
import { useEffect, useState } from "react";
import {
  FileText,
  Folder,
  Library as LibraryIcon,
  Star,
} from "lucide-react";

import { NotebookItem } from "./components/NotebookItem/NotebookItem";
import { NoteItem } from "./components/NoteItem/NoteItem";
import { LibraryEmptyState } from "./components/LibraryEmptyState/LibraryEmptyState";
import { FavouritesView } from "./components/FavouritesView/FavouritesView";

import type { Favourite } from "@features/favourites/types/favourite.types";

import type {
  WorkspaceTree,
} from "@features/workspace/types/workspace.types";

interface Props {
  tree: WorkspaceTree;

  activeNoteId: string | null;

  /**
   * Which view the Library currently displays.
   */
  view: "workspace" | "favourites";

  /**
   * Root-level creation started from the ActivityBar.
   *
   * This is intentionally rendered inline at the top
   * of the Library instead of using a centered modal.
   */
  createMode?: "note" | "notebook" | null;
  onCreateModeChange?: (
    mode: "note" | "notebook" | null,
  ) => void;

  /**
   * Server-provided favourites.
   */
  favourites: Favourite[];

  /**
   * Fast lookup used by NoteItem and NotebookItem.
   */
  favouriteIds: Set<string>;

  onSelectNote: (id: string) => void;

  onCreateNote: (
    notebookId: string | null,
    title: string,
  ) => void;

  onCreateNotebook: (
    parentId: string | null,
    title: string,
  ) => void;

  onRenameNote: (
    id: string,
    title: string,
  ) => void;

  onDeleteNote: (id: string) => void;

  onRenameNotebook: (
    id: string,
    title: string,
  ) => void;

  onDeleteNotebook: (id: string) => void;

  onToggleFavourite: (
    type: "note" | "notebook",
    id: string,
    isFavourite: boolean,
  ) => void;

  /**
   * Used by the Favourites header to return
   * to the normal workspace tree.
   */
  onOpenLibrary?: () => void;
}

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
}: Props) {
  const [newTitle, setNewTitle] = useState("");

  /*
   * Clear the root creation input whenever
   * ActivityBar starts a new creation action.
   */
  useEffect(() => {
    if (createMode) {
      setNewTitle("");
    }
  }, [createMode]);

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
      onCreateNote(null, title);
    } else {
      onCreateNotebook(null, title);
    }

    setNewTitle("");
    onCreateModeChange?.(null);
  }

  const empty =
    tree.notebooks.length === 0 &&
    tree.unfiledNotes.length === 0;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-bg">
      {/* Library header */}
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
        {view === "favourites" ? (
          <>
            <button
              type="button"
              onClick={onOpenLibrary}
              title="Open library"
              aria-label="Open library"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              <LibraryIcon
                size={15}
                strokeWidth={1.7}
              />
            </button>

            <Star
              size={14}
              strokeWidth={1.7}
              className="text-text-muted"
            />

            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Favourites
            </span>
          </>
        ) : (
          <>
            <LibraryIcon
              size={15}
              strokeWidth={1.7}
              className="text-text-muted"
            />

            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Library
            </span>
          </>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {view === "favourites" ? (
          <FavouritesView
            favourites={favourites}
            activeNoteId={activeNoteId}
            onSelectNote={onSelectNote}
            onRemoveFavourite={(
              type,
              id,
            ) =>
              onToggleFavourite(
                type,
                id,
                true,
              )
            }
          />
        ) : (
          <div className="p-1.5">
            {/*
             * Root-level creation.
             *
             * This is intentionally inline inside the Library.
             * It replaces the old centered CreateDialog.
             */}
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
                  className="min-w-0 flex-1 rounded-sm border border-accent bg-bg px-1 text-sm text-text-primary outline-none"
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
                  onSelectNote={onSelectNote}
                  onCreateNote={
                    onCreateNote
                  }
                  onCreateNotebook={
                    onCreateNotebook
                  }
                  onRenameNotebook={
                    onRenameNotebook
                  }
                  onDeleteNotebook={
                    onDeleteNotebook
                  }
                  onRenameNote={
                    onRenameNote
                  }
                  onDeleteNote={
                    onDeleteNote
                  }
                  onToggleFavourite={
                    onToggleFavourite
                  }
                />
              ),
            )}

            {/* Unfiled notes */}
            {tree.unfiledNotes.length >
              0 && (
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
                        note.id ===
                        activeNoteId
                      }
                      isFavourite={favouriteIds.has(
                        `note:${note.id}`,
                      )}
                      onSelect={() =>
                        onSelectNote(
                          note.id,
                        )
                      }
                      onRename={
                        onRenameNote
                      }
                      onDelete={() =>
                        onDeleteNote(
                          note.id,
                        )
                      }
                      onFavourite={() =>
                        onToggleFavourite(
                          "note",
                          note.id,
                          favouriteIds.has(
                            `note:${note.id}`,
                          ),
                        )
                      }
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