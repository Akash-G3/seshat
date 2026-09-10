import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { NoteEditorPane } from "@features/editor/pages/NoteEditorPane";

import { QuickSwitcher } from "@features/search/QuickSwitcher";
import { useRecentNotes } from "@features/search/useRecentNotes";

import { ConfirmDialog } from "@components/ui/ConfirmDialog";

import { ActivityBar } from "@features/activityBar";

import {
  WorkspaceHeader,
  useTabs,
} from "@features/workspaceHeader";

import { Library } from "@features/library";

import {
  useFavourites,
} from "@features/favourites/hooks/useFavourites";

import {
  useAddFavourite,
  useRemoveFavourite,
} from "@features/favourites/hooks/useFavouriteMutations";

import { WorkspaceShell } from "../components/WorkspaceShell";

import { useWorkspaceTree } from "../hooks/useWorkspaceTree";

import {
  useCreateNote,
  useDeleteNote,
  useUpdateNote,
} from "../hooks/useNoteMutations";

import {
  useCreateNotebook,
  useDeleteNotebook,
  useRenameNotebook,
} from "../hooks/useNotebookMutations";

import {
  useRenameWorkspace,
} from "../hooks/useWorkspaceMutations";

interface PendingDelete {
  type: "note" | "notebook";
  id: string;
  label: string;
}

export function Workspace() {
  const [activeNoteId, setActiveNoteId] =
    useState<string | null>(null);

  const [libraryOpen, setLibraryOpen] =
    useState(true);

  /**
   * The Library has two views:
   *
   * workspace  -> normal notebook/note tree
   * favourites -> mixed favourite notes/notebooks
   */
  const [libraryView, setLibraryView] =
    useState<
      "workspace" | "favourites"
    >("workspace");

  const [searchOpen, setSearchOpen] =
    useState(false);

const [createMode, setCreateMode] =
  useState<"note" | "notebook" | null>(null);

  const [pendingDelete, setPendingDelete] =
    useState<PendingDelete | null>(null);

  const {
    workspace,
    tree,
    isLoading,
    isError,
  } = useWorkspaceTree();

  const {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    syncTitles,
  } = useTabs();

  const {
    recent: recentNotes,
    addRecent,
  } = useRecentNotes();

  const workspaceId = workspace?.id;

  const createNote = useCreateNote(
    workspaceId ?? "",
  );

  const createNotebook =
    useCreateNotebook(
      workspaceId ?? "",
    );

  const renameNotebook =
    useRenameNotebook(
      workspaceId ?? "",
    );

  const deleteNotebook =
    useDeleteNotebook(
      workspaceId ?? "",
    );

  const updateNote = useUpdateNote(
    activeNoteId ?? "",
  );

  const deleteNote =
    useDeleteNote();

  const renameWorkspace =
    useRenameWorkspace();

  /*
   * ---------------------------------------------------------
   * FAVOURITES
   * ---------------------------------------------------------
   */

  const {
    data: favourites = [],
  } = useFavourites(
    workspaceId ?? "",
  );

  const addFavourite =
    useAddFavourite(
      workspaceId ?? "",
    );

  const removeFavourite =
    useRemoveFavourite(
      workspaceId ?? "",
    );

  /**
   * Convert the favourite list into a Set.
   *
   * Examples:
   *
   * note:abc
   * notebook:def
   *
   * This makes favourite checks O(1) while rendering
   * the potentially recursive notebook tree.
   */
  const favouriteIds = useMemo(
    () =>
      new Set(
        favourites.map(
          (item) =>
            `${item.type}:${item.id}`,
        ),
      ),
    [favourites],
  );

  function toggleFavourite(
    type: "note" | "notebook",
    id: string,
    isFavourite: boolean,
  ) {
    const target = {
      type,
      id,
    } as const;

    if (isFavourite) {
      removeFavourite.mutate(target);
    } else {
      addFavourite.mutate(target);
    }
  }

  /*
   * ---------------------------------------------------------
   * NOTE LOOKUP / TABS
   * ---------------------------------------------------------
   */

const findNote = useCallback(
  (
    noteId: string,
  ):
    | {
        title: string;
        notebookId: string | null;
      }
    | undefined => {
    if (!tree) {
      return undefined;
    }

    function search(
      notebooks: typeof tree.notebooks,
    ):
      | {
          title: string;
          notebookId: string;
        }
      | undefined {
      for (const notebook of notebooks) {
        const note = notebook.notes.find(
          (item) => item.id === noteId,
        );

        if (note) {
          return {
            title: note.title,
            notebookId: notebook.id,
          };
        }

        const nested = search(
          notebook.children,
        );

        if (nested) {
          return nested;
        }
      }

      return undefined;
    }

    const nested = search(tree.notebooks);

    if (nested) {
      return nested;
    }

    const note = tree.unfiledNotes.find(
      (item) => item.id === noteId,
    );

    return note
      ? {
          title: note.title,
          notebookId: null,
        }
      : undefined;
  },
  [tree],
);

  const selectNote = useCallback(
    (noteId: string) => {
      const info = findNote(noteId);

      const title =
        info?.title || "Untitled";

      openTab({
        noteId,
        title,
        notebookId:
          info?.notebookId ?? null,
      });

      setActiveNoteId(noteId);

      addRecent({
        id: noteId,
        title,
      });
    },
    [
      findNote,
      openTab,
      addRecent,
    ],
  );

  const closeNoteTab = useCallback(
    (noteId: string) => {
      const index =
        tabs.findIndex(
          (tab) =>
            tab.noteId === noteId,
        );

      const next = tabs.filter(
        (tab) =>
          tab.noteId !== noteId,
      );

      closeTab(noteId);

      if (
        activeNoteId === noteId
      ) {
        setActiveNoteId(
          next[index]?.noteId ??
            next[index - 1]
              ?.noteId ??
            null,
        );
      }
    },
    [
      tabs,
      closeTab,
      activeNoteId,
    ],
  );

  /*
   * Keep tab titles synchronized with the
   * current workspace tree.
   */
  useEffect(() => {
    if (!tree) {
      return;
    }

    const titles = new Map<
      string,
      string
    >();

    function collect(
      notebooks: typeof tree.notebooks,
    ) {
      notebooks.forEach(
        (notebook) => {
          notebook.notes.forEach(
            (note) =>
              titles.set(
                note.id,
                note.title,
              ),
          );

          collect(
            notebook.children,
          );
        },
      );
    }

    collect(tree.notebooks);

    tree.unfiledNotes.forEach(
      (note) =>
        titles.set(
          note.id,
          note.title,
        ),
    );

    syncTitles(titles);
  }, [
    tree,
    syncTitles,
  ]);

  /*
   * Keyboard shortcut:
   * Ctrl/Cmd + K -> search.
   */
  useEffect(() => {
    function onKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        (event.metaKey ||
          event.ctrlKey) &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
  }, []);

  /*
   * ---------------------------------------------------------
   * CREATE
   * ---------------------------------------------------------
   */

  function createNewNote(
    notebookId: string | null,
    title: string,
  ) {
    if (!workspaceId) {
      return;
    }

    createNote.mutate(
      {
        notebookId,
        title,
      },
      {
        onSuccess: (note) =>
          selectNote(note.id),
      },
    );

  }

  function createNewNotebook(
    title: string,
    parentId: string | null = null,
  ) {
    if (!workspaceId) {
      return;
    }

    createNotebook.mutate({
      title,
      parentId,
    });

  }

  /*
   * ---------------------------------------------------------
   * DELETE
   * ---------------------------------------------------------
   */

  function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    if (
      pendingDelete.type ===
      "note"
    ) {
      deleteNote.mutate(
        pendingDelete.id,
        {
          onSuccess: () => {
            if (
              activeNoteId ===
              pendingDelete.id
            ) {
              closeTab(
                pendingDelete.id,
              );

              setActiveNoteId(null);
            }
          },
        },
      );
    } else {
      deleteNotebook.mutate(
        pendingDelete.id,
      );
    }

    setPendingDelete(null);
  }

  /*
   * ---------------------------------------------------------
   * LOADING / ERROR
   * ---------------------------------------------------------
   */

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-sm text-text-muted">
        Loading workspace…
      </div>
    );
  }

  if (
    isError ||
    !workspace ||
    !tree
  ) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-sm text-danger">
        Couldn't load workspace
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <>
      <WorkspaceShell
        activityBar={
          <ActivityBar
            libraryOpen={libraryOpen}
            onCreateNote={() =>
              setCreateMode("note")
            }
            onCreateNotebook={() =>
              setCreateMode("notebook")
            }
            onSearch={() =>
              setSearchOpen(true)
            }
            onFavourites={() => {
              /*
               * Favourites is a Library view,
               * not a separate page/modal.
               */
              setLibraryOpen(true);
              setLibraryView(
                "favourites",
              );
            }}
            onToggleLibrary={() => {
              setLibraryOpen(
                (value) => !value,
              );

              /*
               * Clicking the Files/Library toggle
               * takes us back to the normal tree.
               */
              setLibraryView(
                "workspace",
              );
            }}
          />
        }

        library={
          libraryOpen ? (
            <Library
              tree={tree}
              activeNoteId={
                activeNoteId
              }
              view={libraryView}
              favourites={
                favourites
              }
              favouriteIds={
                favouriteIds
              }
              onSelectNote={
                selectNote
              }
              onCreateNote={
                createNewNote
              }
              onCreateNotebook={(
                parentId,
                title,
              ) =>
                createNewNotebook(
                  title,
                  parentId,
                )
              }
              onRenameNote={(
                id,
                title,
              ) =>
                updateNote.mutate({
                  title,
                })
              }
              onDeleteNote={(id) => {
                const note =
                  findNote(id);

                setPendingDelete({
                  type: "note",
                  id,
                  label:
                    note?.title ||
                    "Untitled",
                });
              }}
              onRenameNotebook={(
                id,
                title,
              ) =>
                renameNotebook.mutate({
                  id,
                  title,
                })
              }
              onDeleteNotebook={(id) => {
                const notebook =
                  tree.notebooks.find(
                    (item) =>
                      item.id === id,
                  );

                setPendingDelete({
                  type: "notebook",
                  id,
                  label:
                    notebook?.title ||
                    "Notebook",
                });
              }}
              onToggleFavourite={
                toggleFavourite
              }
              createMode={createMode}
              onCreateModeChange={setCreateMode}
              onOpenLibrary={() =>
                setLibraryView("workspace")
              }
            />
          ) : undefined
        }

        header={
          <WorkspaceHeader
            workspaceName={
              workspace.name
            }
            tabs={tabs}
            activeTabId={
              activeTabId
            }
            onToggleLibrary={() =>
              setLibraryOpen(
                (value) => !value,
              )
            }
            onRenameWorkspace={(
              name,
            ) =>
              renameWorkspace.mutate(
                name,
              )
            }
            onSelectTab={
              selectNote
            }
            onCloseTab={
              closeNoteTab
            }
          />
        }

        content={
          activeNoteId ? (
            <NoteEditorPane
              noteId={
                activeNoteId
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              Select a note to start
              writing.
            </div>
          )
        }
      />

      <QuickSwitcher
        open={searchOpen}
        onClose={() =>
          setSearchOpen(false)
        }
        onSelectNote={
          selectNote
        }
        recentNotes={
          recentNotes
        }
      />

      <ConfirmDialog
        open={
          !!pendingDelete
        }
        title={`Delete ${
          pendingDelete?.type ===
          "notebook"
            ? "notebook"
            : "note"
        }?`}
        message={`“${
          pendingDelete?.label ??
          ""
        }” will be deleted.`}
        onConfirm={
          confirmDelete
        }
        onCancel={() =>
          setPendingDelete(null)
        }
      />
    </>
  );
}