import { useCallback, useEffect, useMemo, useState } from "react";

import { NoteEditorPane } from "@features/editor/pages/NoteEditorPane";
import { QuickSwitcher } from "@features/search/QuickSwitcher";
import { useRecentNotes } from "@features/search/useRecentNotes";
import { ConfirmDialog } from "@components/ui/ConfirmDialog";
import { ActivityBar } from "@features/activityBar";
import { WorkspaceHeader, useTabs } from "@features/workspaceHeader";
import { Library } from "@features/library";
import { useFavourites } from "@features/favourites/hooks/useFavourites";
import { useAddFavourite, useRemoveFavourite } from "@features/favourites/hooks/useFavouriteMutations";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { useWorkspaceTree } from "../hooks/useWorkspaceTree";
import { useCreateNote, useRenameNote, useUpdateNote } from "../hooks/useNoteMutations";
import { useCreateNotebook, useDeleteNotebook, useRenameNotebook } from "../hooks/useNotebookMutations";
import { useRenameWorkspace } from "../hooks/useWorkspaceMutations";
import { ExportDialog } from "@features/export/components/ExportDialog/ExportDialog";
import { CopyDialog } from "@features/export/components/CopyDialog/CopyDialog";
import { ShareDialog } from "@features/share/components/ShareDialog/ShareDialog";
import { useMoveToTrash } from "@features/trash/hooks/useTrash";

type LibraryView = "workspace" | "favourites" | "tags" | "trash";

interface PendingDelete {
  type: "note" | "notebook";
  id: string;
  label: string;
}

interface CopyTarget {
  type: "note" | "notebook";
  id: string;
  title: string;
  notebookId?: string | null;
}

interface ShareTarget {
  type: "note" | "notebook";
  id: string;
  title: string;
}

export function Workspace() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [libraryView, setLibraryView] = useState<LibraryView>("workspace");
  const [searchOpen, setSearchOpen] = useState(false);
  const [createMode, setCreateMode] = useState<"note" | "notebook" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [copyTarget, setCopyTarget] = useState<CopyTarget | null>(null);
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);
  const [exportTarget, setExportTarget] = useState<{ id: string; title: string } | null>(null);

  const { workspace, tree, isLoading, isError } = useWorkspaceTree();
  const { tabs, activeTabId, openTab, closeTab, syncTitles } = useTabs();
  const { recent: recentNotes, addRecent } = useRecentNotes();

  const workspaceId = workspace?.id ?? "";

  const createNote = useCreateNote(workspaceId);
  const createNotebook = useCreateNotebook(workspaceId);
  const renameNotebook = useRenameNotebook(workspaceId);
  const deleteNotebook = useDeleteNotebook(workspaceId);
  const updateNote = useUpdateNote(activeNoteId ?? "");
  const renameNote = useRenameNote();
  const renameWorkspace = useRenameWorkspace();

  const { data: favourites = [] } = useFavourites(workspaceId);
  const addFavourite = useAddFavourite(workspaceId);
  const removeFavourite = useRemoveFavourite(workspaceId);

  const moveToTrash = useMoveToTrash(workspaceId);

  const favouriteIds = useMemo(
    () => new Set(favourites.map((item) => `${item.type}:${item.id}`)),
    [favourites],
  );

  const findNote = useCallback((noteId: string) => {
    if (!tree) return undefined;

    function search(notebooks: typeof tree.notebooks): { title: string; notebookId: string } | undefined {
      for (const notebook of notebooks) {
        const note = notebook.notes.find((item) => item.id === noteId);
        if (note) return { title: note.title, notebookId: notebook.id };
        const nested = search(notebook.children);
        if (nested) return nested;
      }
      return undefined;
    }

    const nested = search(tree.notebooks);
    if (nested) return nested;

    const note = tree.unfiledNotes.find((item) => item.id === noteId);
    return note ? { title: note.title, notebookId: null } : undefined;
  }, [tree]);

  const findNotebook = useCallback((notebookId: string) => {
    if (!tree) return undefined;

    function search(notebooks: typeof tree.notebooks): { id: string; title: string; parentId: string | null } | undefined {
      for (const notebook of notebooks) {
        if (notebook.id === notebookId) {
          return { id: notebook.id, title: notebook.title, parentId: notebook.parentId };
        }
        const nested = search(notebook.children);
        if (nested) return nested;
      }
      return undefined;
    }

    return search(tree.notebooks);
  }, [tree]);

  const selectNote = useCallback((noteId: string) => {
    const info = findNote(noteId);
    const title = info?.title || "Untitled";

    openTab({ noteId, title, notebookId: info?.notebookId ?? null });
    setActiveNoteId(noteId);
    addRecent({ id: noteId, title });
  }, [findNote, openTab, addRecent]);

  const closeNoteTab = useCallback((noteId: string) => {
    const index = tabs.findIndex((tab) => tab.noteId === noteId);
    const next = tabs.filter((tab) => tab.noteId !== noteId);

    closeTab(noteId);

    if (activeNoteId === noteId) {
      setActiveNoteId(next[index]?.noteId ?? next[index - 1]?.noteId ?? null);
    }
  }, [tabs, closeTab, activeNoteId]);

  useEffect(() => {
    if (!tree) return;

    const titles = new Map<string, string>();

    function collect(notebooks: typeof tree.notebooks) {
      notebooks.forEach((notebook) => {
        notebook.notes.forEach((note) => titles.set(note.id, note.title));
        collect(notebook.children);
      });
    }

    collect(tree.notebooks);
    tree.unfiledNotes.forEach((note) => titles.set(note.id, note.title));
    syncTitles(titles);
  }, [tree, syncTitles]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function toggleFavourite(type: "note" | "notebook", id: string, isFavourite: boolean) {
    const target = { type, id } as const;
    if (isFavourite) removeFavourite.mutate(target);
    else addFavourite.mutate(target);
  }

  function createNewNote(notebookId: string | null, title: string) {
    if (!workspaceId) return;

    createNote.mutate({ notebookId, title }, {
      onSuccess: (note) => selectNote(note.id),
    });
  }

  function createNewNotebook(title: string, parentId: string | null = null) {
    if (!workspaceId) return;
    createNotebook.mutate({ title, parentId });
  }

  function askTrash(type: "note" | "notebook", id: string) {
    const label = type === "note"
      ? findNote(id)?.title || "Untitled"
      : findNotebook(id)?.title || "Notebook";

    setPendingDelete({ type, id, label });
  }

  function confirmTrash() {
    if (!pendingDelete) return;

    moveToTrash.mutate(
      { type: pendingDelete.type, id: pendingDelete.id },
      {
        onSuccess: () => {
          if (pendingDelete.type === "note" && activeNoteId === pendingDelete.id) {
            closeTab(pendingDelete.id);
            setActiveNoteId(null);
          }
        },
      },
    );

    setPendingDelete(null);
  }

  function openShare(type: "note" | "notebook", id: string) {
    const title = type === "note"
      ? findNote(id)?.title || "Untitled"
      : findNotebook(id)?.title || "Notebook";

    setShareTarget({ type, id, title });
  }

  function openCopy(type: "note" | "notebook", id: string) {
    const note = type === "note" ? findNote(id) : undefined;
    const notebook = type === "notebook" ? findNotebook(id) : undefined;

    setCopyTarget({
      type,
      id,
      title: type === "note" ? note?.title || "Untitled" : notebook?.title || "Notebook",
      notebookId: note?.notebookId,
    });
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-bg text-sm text-text-muted">Loading workspace…</div>;
  }

  if (isError || !workspace || !tree) {
    return <div className="flex h-screen items-center justify-center bg-bg text-sm text-danger">Couldn't load workspace</div>;
  }

  return (
    <>
      <WorkspaceShell
        activityBar={
          <ActivityBar
            libraryOpen={libraryOpen}
            onCreateNote={() => setCreateMode("note")}
            onCreateNotebook={() => setCreateMode("notebook")}
            onSearch={() => setSearchOpen(true)}
            onOpenLibrary={() => {
              setLibraryOpen(true);
              setLibraryView("workspace");
            }}
            onFavourites={() => {
              setLibraryOpen(true);
              setLibraryView("favourites");
            }}
            onTags={() => {
              setLibraryOpen(true);
              setLibraryView("tags");
            }}
            onTrash={() => {
              setLibraryOpen(true);
              setLibraryView("trash");
            }}
            onToggleLibrary={() => {
              setLibraryOpen((value) => !value);
              setLibraryView("workspace");
            }}
          />
        }
        library={
          libraryOpen ? (
            <Library
              tree={tree}
              workspaceId={workspaceId}
              activeNoteId={activeNoteId}
              view={libraryView}
              favourites={favourites}
              favouriteIds={favouriteIds}
              onSelectNote={selectNote}
              onCreateNote={createNewNote}
              onCreateNotebook={(parentId, title) => createNewNotebook(title, parentId)}
              onRenameNote={(id, title) => renameNote.mutate({ id, title })}
              onDeleteNote={(id) => askTrash("note", id)}
              onRenameNotebook={(id, title) => renameNotebook.mutate({ id, title })}
              onDeleteNotebook={(id) => askTrash("notebook", id)}
              onToggleFavourite={toggleFavourite}
              onShareNote={(id) => openShare("note", id)}
              onShareNotebook={(id) => openShare("notebook", id)}
              onCopyNote={(id) => openCopy("note", id)}
              onCopyNotebook={(id) => openCopy("notebook", id)}
              onExportNote={(id) => {
                setExportTarget({ id, title: findNote(id)?.title || "Untitled" });
              }}
              createMode={createMode}
              onCreateModeChange={setCreateMode}
              onOpenLibrary={() => setLibraryView("workspace")}
            />
          ) : undefined
        }
        header={
          <WorkspaceHeader
            workspaceName={workspace.name}
            tabs={tabs}
            activeTabId={activeTabId}
            onToggleLibrary={() => setLibraryOpen((value) => !value)}
            onRenameWorkspace={(name) => renameWorkspace.mutate(name)}
            onSelectTab={selectNote}
            onCloseTab={closeNoteTab}
          />
        }
        content={
          activeNoteId ? (
            <NoteEditorPane
              noteId={activeNoteId}
              workspaceId={workspaceId}
              onShare={() => openShare("note", activeNoteId)}
              onCopy={() => openCopy("note", activeNoteId)}
              onExport={() => setExportTarget({ id: activeNoteId, title: findNote(activeNoteId)?.title || "Untitled" })}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              Select a note to start writing.
            </div>
          )
        }
      />

      <QuickSwitcher
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectNote={selectNote}
        recentNotes={recentNotes}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Move ${pendingDelete?.type === "notebook" ? "notebook" : "note"} to trash?`}
        message={`“${pendingDelete?.label ?? ""}” can be restored from Trash.`}
        confirmLabel="Move to trash"
        onConfirm={confirmTrash}
        onCancel={() => setPendingDelete(null)}
      />

      {copyTarget && (
        <CopyDialog
          open
          type={copyTarget.type}
          id={copyTarget.id}
          title={copyTarget.title}
          workspaceId={workspaceId}
          notebooks={tree.notebooks}
          currentNotebookId={copyTarget.notebookId}
          onClose={() => setCopyTarget(null)}
        />
      )}

      {exportTarget && (
        <ExportDialog
          open
          noteId={exportTarget.id}
          title={exportTarget.title}
          onClose={() => setExportTarget(null)}
        />
      )}

      {shareTarget && (
        <ShareDialog
          open
          type={shareTarget.type}
          id={shareTarget.id}
          title={shareTarget.title}
          onClose={() => setShareTarget(null)}
        />
      )}
    </>
  );
}
